package athena

import (
	"bufio"
	"compress/gzip"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/charmbracelet/lipgloss"
	"github.com/jackc/pgx/v5"
)

const (
	// SnapshotDepth is the number of book levels to include when snapshotting the orderbook.
	snapshotLevels       = 2000
	snapshotDepthPercent = 0.05
)

// CSVWorkerLoop continuously scans rootPath for trades and incremental_book_L2
// CSV files, processes them (inserts into database), and deletes them upon success.
// If once is true, it exits after one pass.
func (s *Service) CSVWorkerLoop(rootPath, consumer, datatype string, once bool) error {
	ctx := context.Background()
	l.Info("starting CSVWorkerLoop", "rootPath", rootPath, "consumer", consumer, "once", once)

	type Job struct {
		DataType string // "trades" or "incremental_book_L2"
		Exchange string
		Symbol   string
		Pathname string
		Files    []string
	}

	// run mulei-threaded sync
	numWorkers := 1
	var wg sync.WaitGroup
	jobs := make(chan Job, numWorkers)
	l = l.WithPrefix("datasets/import")
	var style = lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("#FAFAFA")).
		BorderForeground(lipgloss.Color("#FF6C00")).
		Padding(2, 4).
		Border(lipgloss.RoundedBorder()).Align(lipgloss.Center)
	// Start the worker goroutines)
	l.Print(style.Render("CSVWorkerLoop started"))
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for job := range jobs {
				l.Debug("handling job", "workerID", workerID, "dataType", job.DataType, "exchange", job.Exchange, "symbol", job.Symbol)
				sort.Strings(job.Files)
				ob := NewOrderbook()
				// mutable reference should be passed - jobs are per-exchange
				for _, fname := range job.Files {
					exists, err := s.datasetExists(job.Exchange, job.Symbol, job.DataType, strings.Replace(fname, ".csv.gz", "", 1))
					if err != nil {
						l.Error("failed to check dataset existence", "exchange", job.Exchange, "symbol", job.Symbol, "datatype", job.DataType, "err", err)
						continue
					}
					if exists {
						l.Debug("item data found in db, skipping.", "exchange", job.Exchange, "symbol", job.Symbol, "datatype", job.DataType, "file", fname)
						continue
					}
					filePath := filepath.Join(job.Pathname, fname)
					l.Info("processing CSV file", "file", filePath)
					// var procErr error
					var procErr error
					switch job.DataType {
					case "trades":
						procErr = s.processTradesFile(ctx, consumer, filePath, job.Exchange, job.Symbol)
					case "incremental_book_L2":
						procErr = s.processL2File(ctx, consumer, filePath, job.Exchange, job.Symbol, ob)
					default:
						continue
					}
					if procErr != nil {
						l.Error("failed to process CSV", "file", filePath, "err", procErr)
						continue
					}
					if err := os.Remove(filePath); err != nil {
						l.Error("failed to remove processed file", "file", filePath, "err", err)
					} else {
						l.Debug("removed processed file", "file", filePath)
					}
				}
			}
		}(i)
	}
	// 		 go func(workerID int) {
	// 				defer	 wg.Done()
	// 		for filePath := range jobs {
	// 					l.Debug("worker processing file", "workerID", workerID, "filePath", filePath)
	// 		var procErr error
	// 		switch datatype {
	//  case "trades":
	// 	 procErr = s.processTradesFile(ctx, consumer, filePath, "", "")
	// 	  case "incremental_book_L2":
	// 			procErr = s.processL2File(ctx, consumer, filePath, "", "")
	// 				default:
	// 					l.Error("unknown datatype", "datatype", datatype)
	// 		 return
	// 				if procErr != nil {
	// 		 l.Error("failed to process file", "filePath", filePath, "err", procErr)
	// 			continue
	// 				}
	// ;l.Debug("processed file successfully", "filePath", filePath)
	// if err := appendSyncLog(filepath.Join(filepath.Dir(filePath), "synclog.csv"), consumer, filepath.Base(filePath)); err != nil {
	//  l.Error("failed to append sync log", "syncLog", filepath.Join(filepath.Dir(filePath), "synclog.csv"), "err", err)
	// } else {
	//  l.Debug("appended sync log", "syncLog", filepath.Join(filepath.Dir(filePath), "synclog.csv"), "file", filepath.Base(filePath))
	// }

	dataTypes := []string{"trades", "incremental_book_L2"}
	// dataTypes := []string{"trades"}
	for {
		exDirs, err := os.ReadDir(rootPath)
		if err != nil {
			l.Error("failed to read root path", "err", err, "rootPath", rootPath)
			return fmt.Errorf("reading root path: %w", err)
		}
		sort.Slice(exDirs, func(i, j int) bool { return exDirs[i].Name() < exDirs[j].Name() })
		for _, ex := range exDirs {
			if !ex.IsDir() {
				continue
			}
			exchange := ex.Name()
			l.Debug("exchange folder", "exchange", exchange)
			// @TEMP
			if exchange != "binance" {
				continue
			}
			symPath := filepath.Join(rootPath, exchange)
			symDirs, err := os.ReadDir(symPath)
			if err != nil {
				continue
			}
			sort.Slice(symDirs, func(i, j int) bool { return symDirs[i].Name() < symDirs[j].Name() })
			for _, sym := range symDirs {
				if !sym.IsDir() {
					continue
				}
				symbol := sym.Name()
				l.Debug("symbol folder", "symbol", symbol)
				if !shouldSyncMarket(symbol) {
					l.Debug("skipping invalid symbol", "symbol", symbol)
					// deleete the folder if it doesn't match our market criteria
					if err := os.RemoveAll(filepath.Join(symPath, symbol)); err != nil {
						l.Error("failed to remove invalid symbol folder", "symbol", symbol, "err", err)
						continue
					}
					continue
				}
				for _, dt := range dataTypes {
					typeDir := filepath.Join(rootPath, exchange, symbol, dt)
					l.Debug("checking datatype folder", "typeDir", typeDir)
					entries, err := os.ReadDir(typeDir)
					if err != nil {
						l.Debug("datatype folder missing/skipped", "typeDir", typeDir, "err", err)
						continue
					}
					if datatype != "" && dt != datatype {
						l.Debug("skipping datatype", "datatype", dt, "requested", datatype)
						continue
					}
					// syncLogPath := filepath.Join(typeDir, "synclog.csv")
					// l.Debug("reading sync log", "syncLog", syncLogPath)
					// processed, err := readSyncLog(syncLogPath)
					// if err != nil {
					// 	l.Error("failed to read sync log", "err", err, "syncLog", syncLogPath)
					// 	return fmt.Errorf("reading sync log for %s: %w", typeDir, err)
					// }
					var files []string
					for _, e := range entries {
						if e.IsDir() {
							continue
						}
						name := e.Name()
						if strings.HasSuffix(name, ".csv.gz") {
							files = append(files, name)
						}
					}
					// sort.Strings(files)
					jobs <- Job{
						DataType: dt,
						Exchange: exchange,
						Symbol:   symbol,
						Pathname: typeDir,
						Files:    files,
					}
				}
			}
		}
		if once {
			break
		}
		time.Sleep(1 * time.Minute)
	}
	wg.Wait()
	close(jobs)
	return nil
}

func (s *Service) datasetExists(exchange string, symbol string, datatype string, date string) (bool, error) {
	var exists bool
	tbl := "orderbook_buckets"
	whereQuery := "time = $2"
	if datatype == "trades" {
		tbl = "trades"
		whereQuery = "timestamp = $2"
	} else {
		return false, nil
	}
	market := strings.ToUpper(exchange) + ":" + strings.ToUpper(symbol)
	market = strings.ReplaceAll(market, "-", "_")
	err := s.pgx.QueryRow(context.Background(), fmt.Sprintf(`
		SELECT EXISTS (SELECT 1 FROM %s WHERE market = $1 AND %s LIMIT 1)
	`, tbl, whereQuery), market, date).Scan(&exists)
	if err != nil {
		l.Error("failed to check dataset existence", "exchange", exchange, "symbol", symbol, "datatype", datatype, "err", err)
		return false, fmt.Errorf("checking dataset existence: %w", err)
	}
	return exists, nil
}

// processTradesFile parses a trades CSV and inserts into trades table.
func (s *Service) processTradesFile(ctx context.Context, consumer, path, exchange, symbol string) error {
	market, err := deriveMarket(exchange, symbol)
	if err != nil {
		return nil
	}
	l.Info("processing trades CSV", "file", path, "exchange", exchange, "symbol", symbol)
	f, err := os.Open(path)
	if err != nil {
		l.Error("failed to open trades file", "err", err, "file", path)
		return err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	defer gz.Close()
	reader := csv.NewReader(bufio.NewReader(gz))
	headers, err := reader.Read()
	if err != nil {
		l.Error("failed to read header from trades CSV", "err", err, "file", path)
		return err
	}
	idx := headerIndex(headers)
	l.Debug("parsed trades CSV headers", "headers", headers)
	for _, h := range []string{"timestamp", "price"} {
		if _, ok := idx[h]; !ok {
			return fmt.Errorf("missing header %s", h)
		}
	}
	// detect quantity/amount/size column
	var sizeKey string
	if _, ok := idx["quantity"]; ok {
		sizeKey = "quantity"
	} else if _, ok := idx["amount"]; ok {
		sizeKey = "amount"
	} else if _, ok := idx["size"]; ok {
		sizeKey = "size"
	} else {
		l.Error("missing quantity/amount/size header in trades CSV", "headers", headers)
		return fmt.Errorf("missing quantity/amount/size header")
	}
	var idKey string
	if _, ok := idx["trade_id"]; ok {
		idKey = "trade_id"
	} else if _, ok := idx["id"]; ok {
		idKey = "id"
	} else {
		return fmt.Errorf("missing id header")
	}
	var makerKey string
	if _, ok := idx["is_buyer_maker"]; ok {
		makerKey = "is_buyer_maker"
	} else if _, ok := idx["maker"]; ok {
		makerKey = "maker"
	}
	var rows [][]interface{}
	for {
		rec, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		tsInt, err := strconv.ParseInt(rec[idx["timestamp"]], 10, 64)
		if err != nil {
			return err
		}
		ts := time.UnixMicro(tsInt)
		price, err := strconv.ParseFloat(rec[idx["price"]], 64)
		if err != nil {
			return err
		}
		qty, err := strconv.ParseFloat(rec[idx[sizeKey]], 64)
		if err != nil {
			return err
		}
		tradeID := rec[idx[idKey]]
		isBuyerMaker := false
		if makerKey != "" {
			isBuyerMaker, _ = strconv.ParseBool(rec[idx[makerKey]])
		}
		rows = append(rows, []interface{}{ts, market, price, qty, isBuyerMaker, tradeID})
	}
	tx, err := s.pgx.Begin(ctx)
	if err != nil {
		l.Error("failed to begin transaction for trades import", "err", err)
		return err
	}
	defer tx.Rollback(ctx)
	_, err = tx.Exec(ctx, `CREATE TEMP TABLE trades_temp (LIKE trades INCLUDING ALL) ON COMMIT DROP`)
	if err != nil {
		return err
	}
	count, err := tx.CopyFrom(ctx, pgx.Identifier{"trades_temp"}, []string{
		"timestamp", "market", "price", "quantity", "is_buyer_maker", "trade_id",
	}, pgx.CopyFromRows(rows))
	if err != nil {
		l.Error("failed to copy trades into temp table", "err", err)
		return err
	}
	l.Debug("copied trades into temp table", "rows", count)
	_, err = tx.Exec(ctx, `
    INSERT INTO trades (timestamp, market, price, quantity, is_buyer_maker, trade_id)
    SELECT timestamp, market, price, quantity, is_buyer_maker, trade_id
    FROM trades_temp
    ON CONFLICT DO NOTHING
  `)
	if err != nil {
		l.Error("failed to insert trades into main table", "err", err)
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		l.Error("failed to commit trades transaction", "err", err)
		return err
	}
	l.Info("completed trades import", "rows", count)
	return nil
}

//
// func (s *Service) findOrCreateOrderbook(ctx context.Context, market string, ts time.Time) (int64, error) {
//  snapshot, err := s.FetchSnapshot(market, ts)
// }

// processL2File parses an incremental_book_L2 CSV and inserts into orderbook_buckets.
func (s *Service) processL2File(ctx context.Context, consumer, path, exchange, symbol string, ob *Orderbook) error {
	market, err := deriveMarket(exchange, symbol)
	if err != nil {
		return nil
	}
	l.Info("processing incremental_book_L2 CSV", "file", path, "exchange", exchange, "symbol", symbol)
	f, err := os.Open(path)
	if err != nil {
		l.Error("failed to open L2 file", "err", err, "file", path)
		return err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	defer gz.Close()
	reader := csv.NewReader(bufio.NewReader(gz))
	headers, err := reader.Read()
	if err != nil {
		l.Error("failed to read header from L2 CSV", "err", err, "file", path)
		return err
	}
	idx := headerIndex(headers)
	l.Debug("parsed L2 CSV headers", "headers", headers)

	// detect quantity/amount column
	amountKey := ""
	if _, ok := idx["quantity"]; ok {
		amountKey = "quantity"
	} else if _, ok := idx["amount"]; ok {
		amountKey = "amount"
	} else {
		l.Error("missing quantity/amount header in L2 CSV", "headers", headers)
		return fmt.Errorf("missing quantity/amount header")
	}

	// ensure required headers exist
	for _, h := range []string{"timestamp", "side", "price"} {
		if _, ok := idx[h]; !ok {
			l.Error("missing header in L2 CSV", "header", h, "headers", headers)
			return fmt.Errorf("missing header %s", h)
		}
	}
	// extract date from pathname
	filename := filepath.Base(path)
	fileDate := strings.TrimSuffix(filename, ".csv.gz")
	fileDateTime, err := time.Parse("2006-01-02", fileDate)
	if err != nil {
		l.Error("failed to parse file date", "fileDate", fileDate, "err", err)
		return fmt.Errorf("parsing file date %s: %w", fileDate, err)
	}

	// do our best to find a usable snapshot from somewhere, we need to drop all
	// events until we find a snapshot otherwise it causes really really bad bugs
	seenSnapshot := false
	if ob == nil {
		dbSnapshot, err := s.FetchSnapshot(market, &fileDateTime)
		if err != nil {
			l.Error("failed to fetch snapshot", "market", market, "err", err)
		} else if dbSnapshot != nil && 1 > 2 {
			isCloseEnough := fileDateTime.Sub(dbSnapshot.Time) <= 5*time.Minute
			if isCloseEnough {
				for _, b := range dbSnapshot.Bids {
					ob.Update("bid", b.Price, b.Size)
				}
				for _, a := range dbSnapshot.Asks {
					ob.Update("ask", a.Price, a.Size)
				}
				seenSnapshot = len(dbSnapshot.Bids) > 0 || len(dbSnapshot.Asks) > 0
				l.Debug("Restored valid, recent snapshot", "market", market, "timestamp", dbSnapshot.Time)
			} else {
				l.Warn("found snapshot but ignoring because it's too far from file date",
					"market", market, "fileDate", fileDateTime, "snapshotTime", dbSnapshot.Time)
			}
		}
		ob = NewOrderbook()
	}
	hasBids := ob.Bids != nil && ob.Bids.Len() > 0
	hasAsks := ob.Asks != nil && ob.Asks.Len() > 0
	if hasBids || hasAsks {
		seenSnapshot = true
	}
	var lastTs time.Time
	var lastInsert time.Time
	var bucketRows []BucketRow
	for {
		rec, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			l.Error("failed to read record from L2 CSV", "err", err, "file", path, "rowsRead", len(bucketRows))
			if len(bucketRows) > 0 {
				l.Debug("inserting partial bucket rows before error", "count", len(bucketRows))
				if err := insertBatch(s.pgx, bucketRows, true); err != nil {
					l.Error("failed to insert partial bucket rows", "err", err)
					return err
				}
				l.Info("inserted partial bucket rows", "rows", len(bucketRows))
			}
			return fmt.Errorf("failed to read record from L2 CSV: %w", err)
		}
		// if we just begun - drop events until we find a snapshot
		if !seenSnapshot {
			isSnap, err := strconv.ParseBool(rec[idx["is_snapshot"]])
			if err != nil {
				l.Error("failed to parse is_snapshot", "err", err, "record", rec)
				return fmt.Errorf("parsing is_snapshot: %w", err)
			}
			// we've yet to see a snapshot, so skip all events until we do
			if !isSnap {
				continue
			}
			l.Info("found initial snapshot in L2 CSV", "ts", rec[idx["timestamp"]], "file", path, "exchange", exchange, "symbol", symbol)
			seenSnapshot = true
		}
		tsInt, err := strconv.ParseInt(rec[idx["timestamp"]], 10, 64)
		if err != nil {
			return err
		}
		ts := time.UnixMicro(tsInt).UTC()
		side := rec[idx["side"]]
		price, err := strconv.ParseFloat(rec[idx["price"]], 64)
		if err != nil {
			return err
		}
		qty, err := strconv.ParseFloat(rec[idx[amountKey]], 64)
		if err != nil {
			return err
		}
		ob.Update(side, price, qty)
		if !lastTs.IsZero() && ts != lastTs && ts.Sub(lastInsert) >= 500*time.Millisecond {
			bids, asks, mid := ob.SnapshotWithDepthLimit(snapshotDepthPercent)
			rows := bucketSnapshot(lastTs, market, mid, DepthStepSize, bids, asks)
			bucketRows = append(bucketRows, rows...)
			lastInsert = ts
		}
		lastTs = ts
	}
	if !lastTs.IsZero() {
		bids, asks, mid := ob.SnapshotWithDepthLimit(snapshotDepthPercent)
		rows := bucketSnapshot(lastTs, market, mid, DepthStepSize, bids, asks)
		bucketRows = append(bucketRows, rows...)
	}
	if len(bucketRows) > 0 {
		l.Debug("inserting bucket rows", "count", len(bucketRows))
		if err := insertBatch(s.pgx, bucketRows, true); err != nil {
			l.Error("failed to insert bucket rows", "err", err)
			return err
		}
		l.Info("completed L2 bucket import", "rows", len(bucketRows))
	}
	return nil
}

// deriveMarket constructs the market string "EXCHANGE:ASSET" and skips non-USD symbols.
func deriveMarket(exchange, symbol string) (string, error) {
	if !isUSDSymbol(symbol) {
		l.Debug("skipping non-USD symbol", "symbol", symbol)
		return "", fmt.Errorf("non-USD symbol %s", symbol)
	}
	return strings.ToUpper(exchange) + ":" + symbol, nil
}

// headerIndex returns a map of lowercase header names to their index.
func headerIndex(headers []string) map[string]int {
	m := make(map[string]int, len(headers))
	for i, h := range headers {
		m[strings.ToLower(h)] = i
	}
	return m
}
