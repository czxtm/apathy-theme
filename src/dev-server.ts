/**
 * Dev server for theme previews.
 *
 * - Serves `dist/previews/` on localhost
 * - Watches `src/` for changes, re-runs the build, then tells every
 *   connected browser to reload via WebSocket
 * - Zero dependencies beyond Bun
 *
 * Usage:  bun run dev          (or: bun run src/dev-server.ts)
 */

import { watch, type FSWatcher } from "fs";
import { join, extname } from "path";
import { spawn, type Subprocess } from "bun";

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3333;
const PREVIEW_DIR = join(import.meta.dir, "..", "dist", "previews");
const SRC_DIR = join(import.meta.dir);
const ROOT = join(import.meta.dir, "..");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// ── Live-reload snippet injected before </body> ────────────────────────────
const RELOAD_SCRIPT = `
<script>
(function() {
  const ws = new WebSocket("ws://" + location.host + "/__ws");
  ws.onmessage = function(e) {
    if (e.data === "reload") location.reload();
  };
  ws.onclose = function() {
    // server died — poll until it comes back
    const poll = setInterval(() => {
      fetch("/").then(() => { clearInterval(poll); location.reload(); }).catch(() => {});
    }, 500);
  };
})();
</script>`;

// ── Connected WebSocket clients ─────────────────────────────────────────────
const clients = new Set<any>();

function broadcast(msg: string) {
  for (const ws of clients) {
    try { ws.send(msg); } catch { clients.delete(ws); }
  }
}

// ── Build runner ────────────────────────────────────────────────────────────
let building = false;
let queued = false;

async function runBuild() {
  if (building) { queued = true; return; }
  building = true;
  const start = performance.now();

  console.log("\x1b[36m⟳ rebuilding…\x1b[0m");

  const proc: Subprocess = spawn(["bun", "run", "src/main.ts"], {
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;

  const elapsed = (performance.now() - start).toFixed(0);
  if (proc.exitCode === 0) {
    console.log(`\x1b[32m✓ built in ${elapsed}ms\x1b[0m`);
    broadcast("reload");
  } else {
    console.log(`\x1b[31m✗ build failed (${elapsed}ms)\x1b[0m`);
  }

  building = false;
  if (queued) { queued = false; runBuild(); }
}

// ── File watcher on src/ ────────────────────────────────────────────────────
let debounce: ReturnType<typeof setTimeout> | null = null;

function startWatcher(): FSWatcher {
  return watch(SRC_DIR, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    // skip dotfiles, node_modules, dist
    if (filename.startsWith(".") || filename.includes("node_modules")) return;

    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log(`\x1b[90m  changed: ${filename}\x1b[0m`);
      runBuild();
    }, 100);
  });
}

// ── HTTP + WS server ────────────────────────────────────────────────────────
const server = Bun.serve({
  port: PORT,

  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/__ws") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // Resolve file path (default to index.html)
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";

    const filePath = join(PREVIEW_DIR, pathname);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return new Response("404 — Not Found", { status: 404 });
    }

    const ext = extname(filePath);
    const contentType = MIME[ext] || "application/octet-stream";

    // For HTML files, inject the live-reload script
    if (ext === ".html") {
      let html = await file.text();
      html = html.replace("</body>", `${RELOAD_SCRIPT}\n</body>`);
      return new Response(html, {
        headers: {
          "content-type": contentType,
          "cache-control": "no-store",
        },
      });
    }

    return new Response(file, {
      headers: { "content-type": contentType },
    });
  },

  websocket: {
    open(ws) { clients.add(ws); },
    close(ws) { clients.delete(ws); },
    message() { /* client doesn't send anything */ },
  },
});

// ── Start ───────────────────────────────────────────────────────────────────
console.log(`
\x1b[1m🎨 Apathy Theme Dev Server\x1b[0m
\x1b[90m━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m
  \x1b[36mLocal:\x1b[0m   http://localhost:${server.port}/
  \x1b[90mServing:\x1b[0m ${PREVIEW_DIR}
  \x1b[90mWatch:\x1b[0m   ${SRC_DIR}

  Edit any file in src/ and the browser will auto-reload.
  Press \x1b[1mCtrl+C\x1b[0m to stop.
`);

// Initial build then start watching
await runBuild();
const watcher = startWatcher();

// Graceful shutdown
process.on("SIGINT", () => {
  watcher.close();
  server.stop();
  process.exit(0);
});
