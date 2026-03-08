/**
 * HTML Preview Generator — renders a self-contained HTML preview for each theme.
 *
 * Drop the output into a VS Code webview (or Simple Browser) to see how the
 * theme's UI components and syntax tokens look while developing.
 */

import type { ThemeDefinition, UIComponents, UserInterface, TokenAssignments, ColorLike } from "../themes/types";
import { get } from "../themes/types";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function hex(value: ColorLike): string {
  if (typeof value === "string") return value;
  try {
    const v: any = value;
    if (v?.hexa) return v.hexa();
    if (v?.cv?.hexa) return v.cv.hexa();
    if (v?.hex) return v.hex();
    if (v?.cv?.hex) return v.cv.hex();
  } catch { /* fallthrough */ }
  return String(value);
}

function safeColor(value: ColorLike | undefined, fallback = "transparent"): string {
  if (!value) return fallback;
  return hex(value);
}

// ────────────────────────────────────────────────────────────────────────────
// Code sample for syntax highlighting preview
// ────────────────────────────────────────────────────────────────────────────

function syntaxBlock(t: TokenAssignments): string {
  const c = (val: string) => val; // passthrough; we use inline styles below
  return `
<div class="code-block">
  <div class="code-line"><span style="color:${get(t.keywords, 'declaration')}">import</span> <span style="color:${get(t.types, 'class')}">React</span><span style="color:${get(t.punctuation, 'delimiter')}">,</span> <span style="color:${get(t.punctuation, 'bracket')}">{</span> <span style="color:${get(t.types, 'interface')}">useState</span> <span style="color:${get(t.punctuation, 'bracket')}">}</span> <span style="color:${get(t.keywords, 'declaration')}">from</span> <span style="color:${get(t.strings, 'default')}">'react'</span><span style="color:${get(t.punctuation, 'delimiter')}">;</span></div>
  <div class="code-line"></div>
  <div class="code-line"><span style="color:${t.comments}">// A simple counter component</span></div>
  <div class="code-line"><span style="color:${get(t.keywords, 'declaration')}">export</span> <span style="color:${get(t.keywords, 'declaration')}">function</span> <span style="color:${get(t.functions, 'declaration')}">Counter</span><span style="color:${get(t.punctuation, 'bracket')}">(</span><span style="color:${get(t.variables, 'parameter')}">props</span><span style="color:${get(t.punctuation, 'delimiter')}">:</span> <span style="color:${get(t.punctuation, 'bracket')}">{</span> <span style="color:${get(t.variables, 'property')}">initial</span><span style="color:${get(t.punctuation, 'delimiter')}">:</span> <span style="color:${get(t.types, 'primitive')}">number</span> <span style="color:${get(t.punctuation, 'bracket')}">}</span><span style="color:${get(t.punctuation, 'bracket')}">)</span> <span style="color:${get(t.punctuation, 'bracket')}">{</span></div>
  <div class="code-line">  <span style="color:${get(t.keywords, 'declaration')}">const</span> <span style="color:${get(t.punctuation, 'bracket')}">[</span><span style="color:${get(t.variables, 'local')}">count</span><span style="color:${get(t.punctuation, 'delimiter')}">,</span> <span style="color:${get(t.functions, 'call')}">setCount</span><span style="color:${get(t.punctuation, 'bracket')}">]</span> <span style="color:${get(t.operators, 'assignment')}">=</span> <span style="color:${get(t.functions, 'call')}">useState</span><span style="color:${get(t.punctuation, 'bracket')}">(</span><span style="color:${get(t.variables, 'property')}">props</span><span style="color:${get(t.punctuation, 'accessor')}">.</span><span style="color:${get(t.variables, 'property')}">initial</span><span style="color:${get(t.punctuation, 'bracket')}">)</span><span style="color:${get(t.punctuation, 'delimiter')}">;</span></div>
  <div class="code-line">  <span style="color:${get(t.keywords, 'declaration')}">const</span> <span style="color:${get(t.variables, 'local')}">MAX</span> <span style="color:${get(t.operators, 'assignment')}">=</span> <span style="color:${get(t.literals, 'number')}">100</span><span style="color:${get(t.punctuation, 'delimiter')}">;</span></div>
  <div class="code-line">  <span style="color:${get(t.keywords, 'declaration')}">const</span> <span style="color:${get(t.variables, 'local')}">isEven</span> <span style="color:${get(t.operators, 'assignment')}">=</span> <span style="color:${get(t.variables, 'local')}">count</span> <span style="color:${get(t.operators, 'arithmetic')}">%</span> <span style="color:${get(t.literals, 'number')}">2</span> <span style="color:${get(t.operators, 'comparison')}">===</span> <span style="color:${get(t.literals, 'number')}">0</span><span style="color:${get(t.punctuation, 'delimiter')}">;</span></div>
  <div class="code-line"></div>
  <div class="code-line">  <span style="color:${get(t.keywords, 'control')}">if</span> <span style="color:${get(t.punctuation, 'bracket')}">(</span><span style="color:${get(t.variables, 'local')}">count</span> <span style="color:${get(t.operators, 'comparison')}">&gt;</span> <span style="color:${get(t.variables, 'local')}">MAX</span><span style="color:${get(t.punctuation, 'bracket')}">)</span> <span style="color:${get(t.punctuation, 'bracket')}">{</span></div>
  <div class="code-line">    <span style="color:${get(t.keywords, 'control')}">return</span> <span style="color:${get(t.literals, 'null')}">&lt;<span style="color:${get(t.meta, 'tag')}">span</span>&gt;</span><span style="color:${get(t.strings, 'default')}">Limit reached</span><span style="color:${get(t.literals, 'null')}">&lt;/<span style="color:${get(t.meta, 'tag')}">span</span>&gt;</span><span style="color:${get(t.punctuation, 'delimiter')}">;</span></div>
  <div class="code-line">  <span style="color:${get(t.punctuation, 'bracket')}">}</span></div>
  <div class="code-line"></div>
  <div class="code-line">  <span style="color:${get(t.keywords, 'control')}">return</span> <span style="color:${get(t.punctuation, 'bracket')}">(</span></div>
  <div class="code-line">    <span style="color:${get(t.literals, 'null')}">&lt;<span style="color:${get(t.meta, 'tag')}">div</span>&gt;</span></div>
  <div class="code-line">      <span style="color:${get(t.literals, 'null')}">&lt;<span style="color:${get(t.meta, 'tag')}">p</span>&gt;</span><span style="color:${get(t.strings, 'default')}">Count: </span><span style="color:${get(t.punctuation, 'bracket')}">{</span><span style="color:${get(t.variables, 'local')}">count</span><span style="color:${get(t.punctuation, 'bracket')}">}</span><span style="color:${get(t.literals, 'null')}">&lt;/<span style="color:${get(t.meta, 'tag')}">p</span>&gt;</span></div>
  <div class="code-line">      <span style="color:${get(t.literals, 'null')}">&lt;<span style="color:${get(t.meta, 'tag')}">p</span>&gt;</span><span style="color:${get(t.strings, 'default')}">Even: </span><span style="color:${get(t.punctuation, 'bracket')}">{</span><span style="color:${get(t.variables, 'local')}">isEven</span> <span style="color:${get(t.operators, 'logical')}">?</span> <span style="color:${get(t.strings, 'default')}">"yes"</span> <span style="color:${get(t.operators, 'logical')}">:</span> <span style="color:${get(t.strings, 'default')}">"no"</span><span style="color:${get(t.punctuation, 'bracket')}">}</span><span style="color:${get(t.literals, 'null')}">&lt;/<span style="color:${get(t.meta, 'tag')}">p</span>&gt;</span></div>
  <div class="code-line">      <span style="color:${get(t.literals, 'null')}">&lt;<span style="color:${get(t.meta, 'tag')}">button</span> <span style="color:${get(t.variables, 'property')}">onClick</span>=<span style="color:${get(t.punctuation, 'bracket')}">{</span><span style="color:${get(t.punctuation, 'bracket')}">(</span><span style="color:${get(t.punctuation, 'bracket')}">)</span> <span style="color:${get(t.operators, 'default')}">=&gt;</span> <span style="color:${get(t.functions, 'call')}">setCount</span><span style="color:${get(t.punctuation, 'bracket')}">(</span><span style="color:${get(t.variables, 'local')}">count</span> <span style="color:${get(t.operators, 'arithmetic')}">+</span> <span style="color:${get(t.literals, 'number')}">1</span><span style="color:${get(t.punctuation, 'bracket')}">)</span><span style="color:${get(t.punctuation, 'bracket')}">}</span>&gt;</span><span style="color:${get(t.strings, 'default')}">Increment</span><span style="color:${get(t.literals, 'null')}">&lt;/<span style="color:${get(t.meta, 'tag')}">button</span>&gt;</span></div>
  <div class="code-line">    <span style="color:${get(t.literals, 'null')}">&lt;/<span style="color:${get(t.meta, 'tag')}">div</span>&gt;</span></div>
  <div class="code-line">  <span style="color:${get(t.punctuation, 'bracket')}">)</span><span style="color:${get(t.punctuation, 'delimiter')}">;</span></div>
  <div class="code-line"><span style="color:${get(t.punctuation, 'bracket')}">}</span></div>
</div>`;
}

// ────────────────────────────────────────────────────────────────────────────
// UI Component Previews
// ────────────────────────────────────────────────────────────────────────────

function uiSection(theme: ThemeDefinition): string {
  const ui = theme.ui;
  const comp = ui.overrides;

  // Build fallback accessors — safely read from overrides, then fall back to ui primitives
  const editor = {
    background: safeColor(comp?.editor?.background, safeColor(ui.backgrounds.surface)),
    foreground: safeColor(comp?.editor?.foreground, safeColor(ui.foregrounds.default)),
    lineHighlight: safeColor(comp?.editor?.lineHighlight, safeColor(ui.highlights?.activeLine?.background)),
    lineHighlightBorder: safeColor(comp?.editor?.lineHighlightBorder, safeColor(ui.borders.subtle)),
    lineNumberForeground: safeColor(comp?.editor?.lineNumberForeground, safeColor(ui.lineNumbers?.foreground)),
    lineNumberActiveForeground: safeColor(comp?.editor?.lineNumberActiveForeground, safeColor(ui.lineNumbers?.activeForeground)),
    selectionBackground: safeColor(comp?.editor?.selectionBackground, safeColor(ui.selection.background)),
    findMatchBackground: safeColor(comp?.editor?.findMatchBackground, safeColor(ui.highlights?.word?.background)),
    findMatchHighlightBackground: safeColor(comp?.editor?.findMatchHighlightBackground, safeColor(ui.highlights?.word?.backgroundStrong)),
  };
  const gutter = {
    background: safeColor(comp?.editorGutter?.background, safeColor(ui.backgrounds.darker)),
  };
  const titleBar = {
    activeBackground: safeColor(comp?.titleBar?.activeBackground, safeColor(ui.backgrounds.base)),
    activeForeground: safeColor(comp?.titleBar?.activeForeground, safeColor(ui.foregrounds.default)),
  };
  const activityBar = {
    background: safeColor(comp?.activityBar?.background, safeColor(ui.backgrounds.darker)),
    foreground: safeColor(comp?.activityBar?.foreground, safeColor(ui.foregrounds.default)),
    inactiveForeground: safeColor(comp?.activityBar?.inactiveForeground, safeColor(ui.foregrounds.muted)),
    border: safeColor(comp?.activityBar?.border, safeColor(ui.borders.default)),
    badgeBackground: safeColor(comp?.activityBar?.badgeBackground, safeColor(ui.accent.primary)),
    badgeForeground: safeColor(comp?.activityBar?.badgeForeground, safeColor(ui.foregrounds.default)),
  };
  const sideBar = {
    background: safeColor(comp?.sideBar?.background, safeColor(ui.backgrounds.base)),
    foreground: safeColor(comp?.sideBar?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.sideBar?.border, safeColor(ui.borders.default)),
    sectionHeaderBackground: safeColor(comp?.sideBar?.sectionHeaderBackground, safeColor(ui.backgrounds.surface)),
    sectionHeaderForeground: safeColor(comp?.sideBar?.sectionHeaderForeground, safeColor(ui.foregrounds.default)),
  };
  const list = {
    hoverBackground: safeColor(comp?.list?.hoverBackground, safeColor(ui.backgrounds.surface)),
    hoverForeground: safeColor(comp?.list?.hoverForeground, safeColor(ui.foregrounds.default)),
    activeSelectionBackground: safeColor(comp?.list?.activeSelectionBackground, safeColor(ui.selection.background)),
    activeSelectionForeground: safeColor(comp?.list?.activeSelectionForeground, safeColor(ui.foregrounds.default)),
  };
  const tabs = {
    activeBackground: safeColor(comp?.tabs?.activeBackground, safeColor(ui.backgrounds.surface)),
    activeForeground: safeColor(comp?.tabs?.activeForeground, safeColor(ui.foregrounds.default)),
    activeBorder: safeColor(comp?.tabs?.activeBorder, safeColor(ui.borders.default)),
    activeBorderTop: safeColor(comp?.tabs?.activeBorderTop, safeColor(ui.accent.primary)),
    inactiveBackground: safeColor(comp?.tabs?.inactiveBackground, safeColor(ui.backgrounds.base)),
    inactiveForeground: safeColor(comp?.tabs?.inactiveForeground, safeColor(ui.foregrounds.muted)),
    modifiedBorder: safeColor(comp?.tabs?.modifiedBorder, safeColor(ui.status.warning)),
  };
  const breadcrumb = {
    background: safeColor(comp?.breadcrumb?.background, safeColor(ui.backgrounds.base)),
    foreground: safeColor(comp?.breadcrumb?.foreground, safeColor(ui.foregrounds.muted)),
    activeSelectionForeground: safeColor(comp?.breadcrumb?.activeSelectionForeground, safeColor(ui.foregrounds.default)),
  };
  const panel = {
    background: safeColor(comp?.panel?.background, safeColor(ui.panels?.background, safeColor(ui.backgrounds.base))),
    border: safeColor(comp?.panel?.border, safeColor(ui.borders.default)),
    titleActiveForeground: safeColor(comp?.panel?.titleActiveForeground, safeColor(ui.foregrounds.default)),
    titleInactiveForeground: safeColor(comp?.panel?.titleInactiveForeground, safeColor(ui.foregrounds.muted)),
    titleActiveBorder: safeColor(comp?.panel?.titleActiveBorder, safeColor(ui.accent.primary)),
  };
  const terminal = {
    background: safeColor(comp?.terminal?.background, safeColor(ui.backgrounds.darker)),
    foreground: safeColor(comp?.terminal?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.terminal?.border, safeColor(ui.borders.default)),
    ansiGreen: safeColor(comp?.terminal?.ansiGreen, safeColor(ui.status.success)),
    ansiCyan: safeColor(comp?.terminal?.ansiCyan, safeColor(ui.status.info)),
    ansiYellow: safeColor(comp?.terminal?.ansiYellow, safeColor(ui.status.warning)),
    ansiRed: safeColor(comp?.terminal?.ansiRed, safeColor(ui.status.error)),
    ansiMagenta: safeColor(comp?.terminal?.ansiMagenta, safeColor(ui.accent.primary)),
    ansiBlue: safeColor(comp?.terminal?.ansiBlue, safeColor(ui.accent.primary)),
  };
  const statusBar = {
    background: safeColor(comp?.statusBar?.background, safeColor(ui.backgrounds.base)),
    foreground: safeColor(comp?.statusBar?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.statusBar?.border, safeColor(ui.borders.default)),
    debuggingBackground: safeColor(comp?.statusBar?.debuggingBackground, safeColor(ui.status.success)),
    debuggingForeground: safeColor(comp?.statusBar?.debuggingForeground, safeColor(ui.foregrounds.default)),
  };

  return `
<!-- ═══ Activity Bar + Sidebar ═══ -->
<div class="ide-shell">
  <div class="activity-bar" style="background:${activityBar.background};border-right:1px solid ${activityBar.border}">
    <div class="ab-icon active" style="color:${activityBar.foreground}">📁</div>
    <div class="ab-icon" style="color:${activityBar.inactiveForeground}">🔍</div>
    <div class="ab-icon" style="color:${activityBar.inactiveForeground}">🔀</div>
    <div class="ab-icon" style="color:${activityBar.inactiveForeground}">🐛</div>
    <div class="ab-badge" style="background:${activityBar.badgeBackground};color:${activityBar.badgeForeground}">3</div>
  </div>

  <!-- Sidebar -->
  <div class="sidebar" style="background:${sideBar.background};border-right:1px solid ${sideBar.border}">
    <div class="sb-header" style="background:${sideBar.sectionHeaderBackground};color:${sideBar.sectionHeaderForeground}">EXPLORER</div>
    <div class="sb-item hover" style="background:${list.hoverBackground};color:${list.hoverForeground}">📄 index.ts</div>
    <div class="sb-item active" style="background:${list.activeSelectionBackground};color:${list.activeSelectionForeground}">📄 theme.ts</div>
    <div class="sb-item" style="color:${sideBar.foreground}">📄 utils.ts</div>
    <div class="sb-item" style="color:${sideBar.foreground}">📁 components/</div>
    <div class="sb-item" style="color:${safeColor(ui.git?.added)}">📄 new-file.ts <small>U</small></div>
    <div class="sb-item" style="color:${safeColor(ui.git?.modified)}">📄 modified.ts <small>M</small></div>
    <div class="sb-item" style="color:${safeColor(ui.git?.deleted)}">📄 removed.ts <small>D</small></div>
  </div>

  <!-- Main editor area -->
  <div class="editor-area">
    <!-- Title Bar -->
    <div class="title-bar" style="background:${titleBar.activeBackground};color:${titleBar.activeForeground}">
      ${theme.name} — preview.tsx
    </div>

    <!-- Tabs -->
    <div class="tab-bar" style="background:${tabs.inactiveBackground}">
      <div class="tab inactive" style="background:${tabs.inactiveBackground};color:${tabs.inactiveForeground};border-right:1px solid ${tabs.activeBorder}">
        index.ts
      </div>
      <div class="tab active" style="background:${tabs.activeBackground};color:${tabs.activeForeground};border-top:2px solid ${tabs.activeBorderTop};border-right:1px solid ${tabs.activeBorder}">
        theme.ts
      </div>
      <div class="tab inactive modified" style="background:${tabs.inactiveBackground};color:${tabs.inactiveForeground};border-right:1px solid ${tabs.activeBorder}">
        utils.ts <span class="dot" style="color:${tabs.modifiedBorder}">●</span>
      </div>
    </div>

    <!-- Breadcrumbs -->
    <div class="breadcrumbs" style="background:${breadcrumb.background};color:${breadcrumb.foreground}">
      src <span style="opacity:.5">/</span> themes <span style="opacity:.5">/</span> <span style="color:${breadcrumb.activeSelectionForeground}">theme.ts</span>
    </div>

    <!-- Editor -->
    <div class="editor" style="background:${editor.background};color:${editor.foreground}">
      <div class="gutter" style="background:${gutter.background}">
        ${Array.from({ length: 20 }, (_, i) => {
          const isCurrent = i === 5;
          return `<div class="ln${isCurrent ? " active" : ""}" style="color:${isCurrent ? editor.lineNumberActiveForeground : editor.lineNumberForeground}">${i + 1}</div>`;
        }).join("\n        ")}
      </div>
      <div class="code-area" style="color:${editor.foreground}">
        <div class="current-line" style="background:${editor.lineHighlight}">
        </div>
        ${syntaxBlock(theme.tokens)}
        <div class="selection-sample" style="background:${editor.selectionBackground}">  selected text example</div>
        <div class="find-match" style="background:${editor.findMatchBackground}">  find match</div>
        <div class="find-match-hl" style="background:${editor.findMatchHighlightBackground}">  other match</div>
      </div>
    </div>

    <!-- Panel (terminal) -->
    <div class="panel" style="background:${panel.background};border-top:1px solid ${panel.border}">
      <div class="panel-tabs">
        <span class="panel-tab active" style="color:${panel.titleActiveForeground};border-bottom:2px solid ${panel.titleActiveBorder}">TERMINAL</span>
        <span class="panel-tab" style="color:${panel.titleInactiveForeground}">PROBLEMS</span>
        <span class="panel-tab" style="color:${panel.titleInactiveForeground}">OUTPUT</span>
      </div>
      <div class="terminal" style="background:${terminal.background};color:${terminal.foreground};border-top:1px solid ${terminal.border}">
        <span style="color:${terminal.ansiGreen}">~</span> <span style="color:${terminal.ansiCyan}">bun run build</span>
        <br><span style="color:${terminal.ansiYellow}">Built: ${theme.name}</span> <span style="color:${terminal.ansiGreen}">✓</span>
        <br><span style="color:${terminal.ansiRed}">error:</span> <span style="color:${terminal.foreground}">Example error message</span>
        <br><span style="color:${terminal.ansiMagenta}">warn:</span> <span style="color:${terminal.foreground}">Example warning</span>
        <br><span style="color:${terminal.ansiBlue}">info:</span> <span style="color:${terminal.foreground}">Example info</span>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar" style="background:${statusBar.background};color:${statusBar.foreground};border-top:1px solid ${statusBar.border}">
      <span>⑂ main</span>
      <span>Ln 6, Col 12</span>
      <span>TypeScript</span>
    </div>
  </div>
</div>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Widgets & Inputs section
// ────────────────────────────────────────────────────────────────────────────

function widgetSection(theme: ThemeDefinition): string {
  const ui = theme.ui;
  const comp = ui.overrides;

  const input = {
    background: safeColor(comp?.input?.background, safeColor(ui.backgrounds.surface)),
    foreground: safeColor(comp?.input?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.input?.border, safeColor(ui.borders.default)),
    placeholderForeground: safeColor(comp?.input?.placeholderForeground, safeColor(ui.foregrounds.subtle)),
  };
  const button = {
    background: safeColor(comp?.button?.background, safeColor(ui.accent.primary)),
    foreground: safeColor(comp?.button?.foreground, safeColor(ui.foregrounds.default)),
    secondaryBackground: safeColor(comp?.button?.secondaryBackground, safeColor(ui.backgrounds.surface)),
    secondaryForeground: safeColor(comp?.button?.secondaryForeground, safeColor(ui.foregrounds.default)),
  };
  const dropdown = {
    background: safeColor(comp?.dropdown?.background, safeColor(ui.backgrounds.surface)),
    foreground: safeColor(comp?.dropdown?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.dropdown?.border, safeColor(ui.borders.default)),
  };
  const badge = {
    background: safeColor(comp?.badge?.background, safeColor(ui.accent.primary)),
    foreground: safeColor(comp?.badge?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.badge?.border, safeColor(ui.borders.default)),
  };
  const notification = {
    background: safeColor(comp?.notification?.background, safeColor(ui.backgrounds.raised)),
    foreground: safeColor(comp?.notification?.foreground, safeColor(ui.foregrounds.default)),
    border: safeColor(comp?.notification?.border, safeColor(ui.borders.default)),
  };
  const diffEditor = {
    insertedLineBackground: safeColor(comp?.diffEditor?.insertedLineBackground, "#09131588"),
    removedLineBackground: safeColor(comp?.diffEditor?.removedLineBackground, "#2e060982"),
  };
  const editorBg = safeColor(comp?.editor?.background, safeColor(ui.backgrounds.surface));
  const statusBarDbg = {
    debuggingBackground: safeColor(comp?.statusBar?.debuggingBackground, safeColor(ui.status.success)),
    debuggingForeground: safeColor(comp?.statusBar?.debuggingForeground, safeColor(ui.foregrounds.default)),
  };

  return `
<div class="widgets-grid">
  <!-- Input -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Input</h4>
    <div class="mock-input" style="background:${input.background};color:${input.foreground};border:1px solid ${input.border}">
      Search files…
    </div>
    <div class="mock-input placeholder" style="background:${input.background};color:${input.placeholderForeground};border:1px solid ${input.border}">
      placeholder text
    </div>
  </div>

  <!-- Buttons -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Buttons</h4>
    <button class="mock-btn primary" style="background:${button.background};color:${button.foreground}">Primary</button>
    <button class="mock-btn secondary" style="background:${button.secondaryBackground};color:${button.secondaryForeground}">Secondary</button>
  </div>

  <!-- Dropdown -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Dropdown</h4>
    <div class="mock-dropdown" style="background:${dropdown.background};color:${dropdown.foreground};border:1px solid ${dropdown.border}">
      TypeScript React ▾
    </div>
  </div>

  <!-- Badge -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Badge</h4>
    <span class="mock-badge" style="background:${badge.background};color:${badge.foreground};border:1px solid ${badge.border}">12</span>
    <span class="mock-badge" style="background:${safeColor(ui.status.error)};color:#fff">3</span>
    <span class="mock-badge" style="background:${safeColor(ui.status.warning)};color:#000">!</span>
  </div>

  <!-- Notifications -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Notification</h4>
    <div class="mock-notification" style="background:${notification.background};color:${notification.foreground};border:1px solid ${notification.border}">
      Extension activated successfully
    </div>
  </div>

  <!-- Status colors -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Status</h4>
    <div class="status-row"><span class="dot" style="background:${safeColor(ui.status.error)}"></span> Error</div>
    <div class="status-row"><span class="dot" style="background:${safeColor(ui.status.warning)}"></span> Warning</div>
    <div class="status-row"><span class="dot" style="background:${safeColor(ui.status.info)}"></span> Info</div>
    <div class="status-row"><span class="dot" style="background:${safeColor(ui.status.success)}"></span> Success</div>
  </div>

  <!-- Diff colors -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Diff Editor</h4>
    <div class="diff-line inserted" style="background:${diffEditor.insertedLineBackground}">+ added line</div>
    <div class="diff-line removed" style="background:${diffEditor.removedLineBackground}">- removed line</div>
    <div class="diff-line" style="background:${editorBg}">  unchanged line</div>
  </div>

  <!-- Debugging status bar -->
  <div class="widget-card" style="background:${safeColor(ui.backgrounds.surface)}">
    <h4>Debugging Bar</h4>
    <div class="mock-status-bar" style="background:${statusBarDbg.debuggingBackground};color:${statusBarDbg.debuggingForeground}">
      ▶ Debugging — app.ts
    </div>
  </div>
</div>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Core UI Tokens — explicit display of primitive design tokens
// ────────────────────────────────────────────────────────────────────────────

function coreTokensSection(theme: ThemeDefinition): string {
  const ui = theme.ui;

  type TokenRow = { label: string; value: string; kind: "bg" | "fg" | "border" | "accent" | "status" };

  const rows: TokenRow[] = [
    // Backgrounds
    { label: "backgrounds.base",      value: safeColor(ui.backgrounds.base),      kind: "bg" },
    { label: "backgrounds.darker",    value: safeColor(ui.backgrounds.darker),    kind: "bg" },
    { label: "backgrounds.surface",   value: safeColor(ui.backgrounds.surface),   kind: "bg" },
    { label: "backgrounds.raised",    value: safeColor(ui.backgrounds.raised),    kind: "bg" },
    { label: "backgrounds.overlay",   value: safeColor(ui.backgrounds.overlay),   kind: "bg" },
    { label: "backgrounds.codeBlock", value: safeColor(ui.backgrounds.codeBlock), kind: "bg" },

    // Foregrounds
    { label: "foregrounds.default", value: safeColor(ui.foregrounds.default), kind: "fg" },
    { label: "foregrounds.muted",   value: safeColor(ui.foregrounds.muted),   kind: "fg" },
    { label: "foregrounds.subtle",  value: safeColor(ui.foregrounds.subtle),  kind: "fg" },
    { label: "foregrounds.accent",  value: safeColor(ui.foregrounds.accent),  kind: "fg" },
    { label: "foregrounds.focused", value: safeColor(ui.foregrounds.focused), kind: "fg" },

    // Borders
    { label: "borders.default",   value: safeColor(ui.borders.default),   kind: "border" },
    { label: "borders.active",    value: safeColor(ui.borders.active),    kind: "border" },
    { label: "borders.subtle",    value: safeColor(ui.borders.subtle),    kind: "border" },
    { label: "borders.separator", value: safeColor(ui.borders.separator), kind: "border" },

    // Accent
    { label: "accent.primary",           value: safeColor(ui.accent.primary),           kind: "accent" },
    { label: "accent.primaryForeground", value: safeColor(ui.accent.primaryForeground), kind: "accent" },
    ...(ui.accent.secondary ? [{ label: "accent.secondary", value: safeColor(ui.accent.secondary), kind: "accent" as const }] : []),

    // Status
    { label: "status.error",   value: safeColor(ui.status.error),   kind: "status" },
    { label: "status.warning", value: safeColor(ui.status.warning), kind: "status" },
    { label: "status.info",    value: safeColor(ui.status.info),    kind: "status" },
    { label: "status.success", value: safeColor(ui.status.success), kind: "status" },

    // Selection
    { label: "selection.background", value: safeColor(ui.selection.background), kind: "bg" },

    // Highlights
    { label: "highlights.activeLine",   value: safeColor(ui.highlights?.activeLine?.background), kind: "bg" },
    { label: "highlights.word",         value: safeColor(ui.highlights?.word?.background),       kind: "bg" },
    { label: "highlights.wordStrong",   value: safeColor(ui.highlights?.word?.backgroundStrong), kind: "bg" },
  ];

  const kindLabels: Record<string, string> = {
    bg: "Background",
    fg: "Foreground",
    border: "Border",
    accent: "Accent",
    status: "Status",
  };

  const grouped = new Map<string, TokenRow[]>();
  for (const r of rows) {
    const arr = grouped.get(r.kind) ?? [];
    arr.push(r);
    grouped.set(r.kind, arr);
  }

  const baseBg = safeColor(ui.backgrounds.base);
  const surfaceBg = safeColor(ui.backgrounds.surface);
  const defaultFg = safeColor(ui.foregrounds.default);
  const subtleBorder = safeColor(ui.borders.subtle);

  let html = `<div class="core-tokens">`;
  for (const [kind, items] of grouped.entries()) {
    html += `<div class="core-tokens-group">`;
    html += `<h4>${kindLabels[kind] ?? kind}</h4>`;
    html += `<div class="core-tokens-list">`;
    for (const item of items) {
      if (kind === "bg") {
        // Show as a filled rectangle with the label on top
        html += `
        <div class="core-token-item">
          <div class="core-token-swatch bg" style="background:${item.value};border:1px solid ${subtleBorder}">
            <span class="core-token-swatch-text" style="color:${defaultFg}">${item.label}</span>
          </div>
          <code class="core-token-hex">${item.value}</code>
        </div>`;
      } else if (kind === "fg") {
        // Show text rendered in that color
        html += `
        <div class="core-token-item">
          <div class="core-token-swatch fg" style="background:${baseBg};border:1px solid ${subtleBorder}">
            <span style="color:${item.value}">${item.label}</span>
          </div>
          <code class="core-token-hex">${item.value}</code>
        </div>`;
      } else if (kind === "border") {
        // Show a box with that border color
        html += `
        <div class="core-token-item">
          <div class="core-token-swatch border-demo" style="background:${surfaceBg};border:2px solid ${item.value}">
            <span style="color:${defaultFg}">${item.label}</span>
          </div>
          <code class="core-token-hex">${item.value}</code>
        </div>`;
      } else {
        // Accent / status — colored pill
        html += `
        <div class="core-token-item">
          <div class="core-token-swatch pill" style="background:${item.value};border:1px solid ${subtleBorder}">
            <span class="core-token-swatch-text" style="color:${kind === "status" ? "#000" : defaultFg}">${item.label}</span>
          </div>
          <code class="core-token-hex">${item.value}</code>
        </div>`;
      }
    }
    html += `</div></div>`;
  }
  html += `</div>`;
  return html;
}

// ────────────────────────────────────────────────────────────────────────────
// Color palette swatches
// ────────────────────────────────────────────────────────────────────────────

function paletteSection(theme: ThemeDefinition): string {
  const entries = Object.entries(theme.palette);
  const swatches = entries.map(([name, color]) => {
    const c = String(color);
    return `<div class="swatch" title="${name}: ${c}"><div class="swatch-color" style="background:${c}"></div><div class="swatch-label">${name}</div></div>`;
  }).join("\n    ");

  return `
<div class="palette-grid">
  ${swatches}
</div>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Token color reference table
// ────────────────────────────────────────────────────────────────────────────

function tokenTable(tokens: TokenAssignments): string {
  const categories = [
    { name: "Source", color: tokens.source, sample: "identifier" },
    { name: "Comments", color: tokens.comments, sample: "// comment" },
    { name: "String", color: get(tokens.strings, "default"), sample: '"hello world"' },
    { name: "Regex", color: get(tokens.strings, "regex"), sample: "/pattern/g" },
    { name: "Operator", color: get(tokens.operators, "default"), sample: "= + - * /" },
    { name: "Number", color: get(tokens.literals, "number"), sample: "42  3.14  0xFF" },
    { name: "Boolean", color: get(tokens.literals, "boolean"), sample: "true  false" },
    { name: "Null", color: get(tokens.literals, "null"), sample: "null  undefined" },
    { name: "Keyword (ctrl)", color: get(tokens.keywords, "control"), sample: "if  else  return  for" },
    { name: "Keyword (decl)", color: get(tokens.keywords, "declaration"), sample: "const  let  function  class" },
    { name: "Keyword (import)", color: get(tokens.keywords, "import"), sample: "import  export  from" },
    { name: "Keyword (mod)", color: get(tokens.keywords, "modifier"), sample: "async  static  public" },
    { name: "Variable", color: get(tokens.variables, "local"), sample: "count  data  result" },
    { name: "Parameter", color: get(tokens.variables, "parameter"), sample: "props  args  event" },
    { name: "Property", color: get(tokens.variables, "property"), sample: "obj.key  this.value" },
    { name: "Function (decl)", color: get(tokens.functions, "declaration"), sample: "function myFn()" },
    { name: "Function (call)", color: get(tokens.functions, "call"), sample: "myFn()  doStuff()" },
    { name: "Method", color: get(tokens.functions, "method"), sample: "arr.map()  str.trim()" },
    { name: "Built-in fn", color: get(tokens.functions, "builtin"), sample: "console.log  parseInt" },
    { name: "Type/Class", color: get(tokens.types, "class"), sample: "MyClass  React  Map" },
    { name: "Interface", color: get(tokens.types, "interface"), sample: "IProps  Readable" },
    { name: "Enum", color: get(tokens.types, "enum"), sample: "Status  Direction" },
    { name: "Primitive type", color: get(tokens.types, "primitive"), sample: "string  number  boolean" },
    { name: "Type param", color: get(tokens.types, "typeParameter"), sample: "<T>  <K, V>" },
    { name: "Namespace", color: get(tokens.types, "namespace"), sample: "React  fs  path" },
    { name: "Decorator", color: get(tokens.meta, "decorator"), sample: "@Injectable  @override" },
    { name: "Macro", color: get(tokens.meta, "macro"), sample: "macro!  #define" },
    { name: "Tag", color: get(tokens.meta, "tag"), sample: "<div>  <span>" },
    { name: "Bracket", color: get(tokens.punctuation, "bracket"), sample: "( ) [ ] { }" },
    { name: "Delimiter", color: get(tokens.punctuation, "delimiter"), sample: ", ; :" },
    { name: "Accessor", color: get(tokens.punctuation, "accessor"), sample: ". ?. ::" },
    { name: "Storage", color: get(tokens.storage, "type"), sample: "let  const  var" },
  ];

  const rows = categories.map(({ name, color, sample }) => `
    <tr>
      <td>${name}</td>
      <td><span class="swatch-inline" style="background:${color}"></span> <code>${color}</code></td>
      <td style="color:${color}"><code>${sample}</code></td>
    </tr>`).join("");

  return `<table class="token-table">
  <thead><tr><th>Token</th><th>Color</th><th>Sample</th></tr></thead>
  <tbody>${rows}</tbody>
</table>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Color picker panel + live-edit script (injected into dev preview)
// ────────────────────────────────────────────────────────────────────────────

function colorPickerScript(theme: ThemeDefinition): string {
  const paletteEntries = Object.entries(theme.palette).map(([name, color]) => ({
    path: `palette.${name}`,
    label: name,
    value: safeColor(color as any),
  }));

  const uiEntries = [
    { path: "ui.backgrounds.base", label: "bg.base", value: safeColor(theme.ui.backgrounds.base) },
    { path: "ui.backgrounds.surface", label: "bg.surface", value: safeColor(theme.ui.backgrounds.surface) },
    { path: "ui.backgrounds.raised", label: "bg.raised", value: safeColor(theme.ui.backgrounds.raised) },
    { path: "ui.foregrounds.default", label: "fg.default", value: safeColor(theme.ui.foregrounds.default) },
    { path: "ui.foregrounds.muted", label: "fg.muted", value: safeColor(theme.ui.foregrounds.muted) },
    { path: "ui.foregrounds.subtle", label: "fg.subtle", value: safeColor(theme.ui.foregrounds.subtle) },
    { path: "ui.accent.primary", label: "accent", value: safeColor(theme.ui.accent.primary) },
    { path: "ui.status.error", label: "error", value: safeColor(theme.ui.status.error) },
    { path: "ui.status.warning", label: "warning", value: safeColor(theme.ui.status.warning) },
    { path: "ui.status.info", label: "info", value: safeColor(theme.ui.status.info) },
    { path: "ui.status.success", label: "success", value: safeColor(theme.ui.status.success) },
    { path: "ui.borders.default", label: "border", value: safeColor(theme.ui.borders.default) },
  ];

  const allEntries = [...uiEntries, ...paletteEntries];
  const entriesJson = JSON.stringify(allEntries);
  const themeName = theme.name;

  return `
<style>
  .color-picker-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    max-height: 100vh;
    overflow-y: auto;
    background: #0a0a0efa;
    border-left: 1px solid #ffffff15;
    padding: 12px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 11px;
    color: #b0b0b8;
    transition: transform .2s;
    box-shadow: -4px 0 24px #00000040;
  }
  .color-picker-panel.collapsed { transform: translateX(268px); }
  .color-picker-panel.collapsed .cp-body { display: none; }
  .cp-toggle {
    position: absolute;
    left: -28px;
    top: 8px;
    width: 28px;
    height: 28px;
    background: #0a0a0efa;
    border: 1px solid #ffffff15;
    border-right: none;
    border-radius: 6px 0 0 6px;
    color: #b0b0b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .cp-header {
    font-size: 13px;
    font-weight: 600;
    color: #e0e0e8;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cp-section { margin-bottom: 10px; }
  .cp-section-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: .8px;
    opacity: .5;
    margin-bottom: 6px;
    padding-top: 6px;
    border-top: 1px solid #ffffff10;
  }
  .cp-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 3px;
  }
  .cp-row input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    border: 1px solid #ffffff20;
    border-radius: 4px;
    width: 24px;
    height: 20px;
    padding: 0;
    cursor: pointer;
    background: transparent;
  }
  .cp-row input[type="color"]::-webkit-color-swatch-wrapper { padding: 1px; }
  .cp-row input[type="color"]::-webkit-color-swatch { border: none; border-radius: 2px; }
  .cp-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cp-hex {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 10px;
    opacity: .6;
    width: 62px;
    text-align: right;
  }
  .cp-reset {
    font-size: 10px;
    color: #888;
    background: none;
    border: 1px solid #ffffff15;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
  }
  .cp-reset:hover { color: #e0e0e8; border-color: #ffffff30; }
  .cp-dirty { background: #ffffff08; border-radius: 3px; padding: 1px 2px; }
  .cp-status {
    font-size: 10px;
    opacity: .4;
    text-align: center;
    padding: 4px;
  }
</style>
<script>
(function() {
  var THEME_NAME = ${JSON.stringify(themeName)};
  var entries = ${entriesJson};
  var originals = {};
  entries.forEach(function(e) { originals[e.path] = e.value; });
  var overrides = {};
  var panel = document.createElement('div');
  panel.className = 'color-picker-panel';
  var toggle = document.createElement('button');
  toggle.className = 'cp-toggle';
  toggle.textContent = '🎨';
  toggle.onclick = function() { panel.classList.toggle('collapsed'); };
  panel.appendChild(toggle);

  var header = document.createElement('div');
  header.className = 'cp-header';
  header.innerHTML = '<span>Color Editor</span>';
  var resetBtn = document.createElement('button');
  resetBtn.className = 'cp-reset';
  resetBtn.textContent = 'Reset All';
  resetBtn.onclick = function() {
    overrides = {};
    entries.forEach(function(e) {
      var input = document.getElementById('cp-' + e.path);
      if (input) { input.value = toHex6(e.value); }
      var hexLabel = document.getElementById('cpv-' + e.path);
      if (hexLabel) { hexLabel.textContent = e.value.slice(0, 7); }
      var row = document.getElementById('cpr-' + e.path);
      if (row) { row.classList.remove('cp-dirty'); }
    });
    sendOverrides();
  };
  header.appendChild(resetBtn);
  panel.appendChild(header);

  var body = document.createElement('div');
  body.className = 'cp-body';

  function toHex6(val) {
    if (!val) return '#000000';
    var s = val.replace(/[^0-9a-fA-F#]/g, '');
    if (s.length === 9) s = s.slice(0, 7);
    if (s.length === 4) s = '#' + s[1]+s[1] + s[2]+s[2] + s[3]+s[3];
    return s.slice(0, 7);
  }

  var uiPaths = entries.filter(function(e) { return !e.path.startsWith('palette.'); });
  var palettePaths = entries.filter(function(e) { return e.path.startsWith('palette.'); });

  function makeSection(title, items) {
    var sec = document.createElement('div');
    sec.className = 'cp-section';
    var t = document.createElement('div');
    t.className = 'cp-section-title';
    t.textContent = title;
    sec.appendChild(t);
    items.forEach(function(e) {
      var row = document.createElement('div');
      row.className = 'cp-row';
      row.id = 'cpr-' + e.path;
      var input = document.createElement('input');
      input.type = 'color';
      input.id = 'cp-' + e.path;
      input.value = toHex6(e.value);
      var label = document.createElement('span');
      label.className = 'cp-label';
      label.textContent = e.label;
      label.title = e.path;
      var hexLabel = document.createElement('span');
      hexLabel.className = 'cp-hex';
      hexLabel.id = 'cpv-' + e.path;
      hexLabel.textContent = e.value.slice(0, 7);
      input.addEventListener('input', function(ev) {
        var val = ev.target.value;
        hexLabel.textContent = val;
        overrides[e.path] = val;
        row.classList.add('cp-dirty');
        scheduleUpdate();
      });
      row.appendChild(input);
      row.appendChild(label);
      row.appendChild(hexLabel);
      sec.appendChild(row);
    });
    return sec;
  }

  body.appendChild(makeSection('UI Colors', uiPaths));
  body.appendChild(makeSection('Palette', palettePaths));

  var status = document.createElement('div');
  status.className = 'cp-status';
  status.id = 'cp-status';
  status.textContent = 'Ready';
  body.appendChild(status);

  panel.appendChild(body);
  document.body.appendChild(panel);

  var debounceTimer = null;
  function scheduleUpdate() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendOverrides, 120);
  }

  var ws = null;
  var wsReady = false;
  function connectWS() {
    ws = new WebSocket('ws://' + location.host + '/__ws');
    ws.onopen = function() {
      wsReady = true;
      document.getElementById('cp-status').textContent = 'Connected';
    };
    ws.onmessage = function(ev) {
      try {
        var msg = JSON.parse(ev.data);
        if (msg.type === 'preview_update') {
          applyUpdate(msg.html);
        }
      } catch(e) {
        if (ev.data === 'reload' && Object.keys(overrides).length === 0) {
          location.reload();
        }
      }
    };
    ws.onclose = function() {
      wsReady = false;
      document.getElementById('cp-status').textContent = 'Disconnected';
      setTimeout(connectWS, 1000);
    };
  }
  connectWS();

  function sendOverrides() {
    if (!wsReady || !ws) return;
    var keys = Object.keys(overrides);
    if (keys.length === 0) return;
    document.getElementById('cp-status').textContent = 'Rebuilding\u2026';
    ws.send(JSON.stringify({
      type: 'color_override',
      theme: THEME_NAME,
      overrides: overrides,
    }));
  }

  function applyUpdate(html) {
    var scrollY = window.scrollY;
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var newPage = doc.querySelector('.page');
    var oldPage = document.querySelector('.page');
    if (newPage && oldPage) {
      oldPage.innerHTML = newPage.innerHTML;
    }
    var newStyle = doc.querySelector('style');
    var oldStyle = document.querySelector('style');
    if (newStyle && oldStyle) {
      oldStyle.textContent = newStyle.textContent;
    }
    window.scrollTo(0, scrollY);
    document.getElementById('cp-status').textContent = 'Updated';
  }
})();
</script>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Full page HTML
// ────────────────────────────────────────────────────────────────────────────

export function generatePreviewHTML(theme: ThemeDefinition): string {
  const bg = safeColor(theme.ui.backgrounds.base, "#0f0f15");
  const fg = safeColor(theme.ui.foregrounds.default, "#e1e2e5");
  const surface = safeColor(theme.ui.backgrounds.surface, "#1a1a24");
  const accent = safeColor(theme.ui.accent.primary, "#33b3cc");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${theme.name} — Theme Preview</title>
<style>
  /* ── Reset ─────────────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: ${bg};
    color: ${fg};
    padding: 0;
    line-height: 1.5;
  }

  /* ── Layout ────────────────────────────────────────────────────── */
  .page { max-width: 1400px; margin: 0 auto; padding: 24px; }

  h1 { color: ${accent}; font-size: 28px; margin-bottom: 4px; }
  h2 { color: ${accent}; font-size: 20px; margin: 32px 0 16px; border-bottom: 1px solid ${safeColor(theme.ui.borders.default)}; padding-bottom: 8px; opacity: .85; }
  h3 { color: ${fg}; font-size: 16px; margin: 16px 0 8px; opacity: .7; }
  h4 { font-size: 13px; opacity: .6; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px; }
  .subtitle { opacity: .5; margin-bottom: 24px; }

  /* ── IDE Shell ─────────────────────────────────────────────────── */
  .ide-shell {
    display: grid;
    grid-template-columns: 48px 220px 1fr;
    border: 1px solid ${safeColor(theme.ui.borders.default)};
    border-radius: 8px;
    overflow: hidden;
    height: 620px;
  }

  .activity-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 4px;
  }
  .ab-icon { font-size: 20px; padding: 8px; cursor: pointer; opacity: .8; }
  .ab-icon.active { opacity: 1; }
  .ab-badge { font-size: 10px; padding: 2px 6px; border-radius: 99px; margin-top: auto; }

  .sidebar { overflow-y: auto; padding-bottom: 8px; }
  .sb-header { padding: 8px 12px; font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
  .sb-item { padding: 4px 12px 4px 20px; font-size: 13px; cursor: pointer; white-space: nowrap; }
  .sb-item small { opacity: .6; margin-left: 4px; }

  .editor-area { display: flex; flex-direction: column; overflow: hidden; }

  .title-bar { padding: 6px 16px; font-size: 13px; text-align: center; font-weight: 500; }

  .tab-bar { display: flex; overflow-x: auto; }
  .tab { padding: 8px 16px; font-size: 12px; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
  .tab .dot { font-size: 8px; }

  .breadcrumbs { padding: 4px 16px; font-size: 12px; opacity: .8; }

  .editor {
    flex: 1;
    display: flex;
    overflow: auto;
    font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Menlo, monospace;
    font-size: 13px;
    line-height: 1.6;
  }
  code {
    font-family: 'Source Code Pro', 'Monaspace Neon Var', 'Cascadia Code', 'JetBrains Mono', 'SF Mono', Menlo, monospace;
  }
  .gutter { padding: 4px 8px; text-align: right; user-select: none; min-width: 44px; }
  .gutter .ln { font-size: 12px; line-height: 1.6; }
  .gutter .ln.active { font-weight: 600; }
  .code-area { flex: 1; padding: 4px 16px; position: relative; overflow-x: auto; }
  .code-block { white-space: pre; }
  .code-line { white-space: pre; min-height: 1.6em; }
  .current-line { position: absolute; left: 0; right: 0; height: 1.6em; top: calc(5 * 1.6em + 4px); pointer-events: none; }
  .selection-sample, .find-match, .find-match-hl { white-space: pre; border-radius: 2px; display: inline-block; margin-top: 4px; padding: 0 4px; }

  .panel { height: 140px; display: flex; flex-direction: column; }
  .panel-tabs { display: flex; gap: 16px; padding: 6px 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
  .panel-tab { padding-bottom: 4px; cursor: pointer; }
  .terminal {
    flex: 1;
    padding: 8px 16px;
    font-family: 'Fira Code', 'Cascadia Code', Menlo, monospace;
    font-size: 12px;
    line-height: 1.5;
    overflow: auto;
  }

  .status-bar { display: flex; justify-content: space-between; padding: 2px 16px; font-size: 12px; }

  /* ── Widgets ───────────────────────────────────────────────────── */
  .widgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .widget-card { padding: 16px; border-radius: 8px; border: 1px solid ${safeColor(theme.ui.borders.subtle)}; }
  .mock-input { padding: 6px 10px; border-radius: 4px; font-size: 13px; margin-bottom: 8px; }
  .mock-input.placeholder { opacity: .6; }
  .mock-btn { padding: 6px 16px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; margin-right: 8px; }
  .mock-dropdown { padding: 6px 10px; border-radius: 4px; font-size: 13px; cursor: pointer; }
  .mock-badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; margin-right: 6px; }
  .mock-notification { padding: 10px 14px; border-radius: 6px; font-size: 13px; }
  .mock-status-bar { padding: 4px 16px; border-radius: 4px; font-size: 12px; }
  .status-row { display: flex; align-items: center; gap: 8px; padding: 2px 0; font-size: 13px; }
  .status-row .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .diff-line { padding: 2px 8px; font-family: monospace; font-size: 12px; margin: 1px 0; }

  /* ── Palette ───────────────────────────────────────────────────── */
  .palette-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
  .swatch { text-align: center; }
  .swatch-color { width: 100%; height: 40px; border-radius: 6px; border: 1px solid ${safeColor(theme.ui.borders.subtle)}; }
  .swatch-label { font-size: 10px; opacity: .6; margin-top: 4px; word-break: break-all; }

  /* ── Token Table ───────────────────────────────────────────────── */
  .token-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .token-table th { text-align: left; padding: 8px; border-bottom: 2px solid ${safeColor(theme.ui.borders.default)}; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; opacity: .6; }
  .token-table td { padding: 6px 8px; border-bottom: 1px solid ${safeColor(theme.ui.borders.subtle)}; }
  .token-table code { font-family: monospace; font-size: 11px; opacity: .7; }
  .swatch-inline { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: middle; margin-right: 4px; }

  /* ── Core UI Tokens ────────────────────────────────────────────── */
  .core-tokens { display: flex; flex-direction: column; gap: 20px; }
  .core-tokens-group h4 { margin-bottom: 10px; }
  .core-tokens-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  .core-token-item { display: flex; flex-direction: column; gap: 4px; }
  .core-token-swatch { border-radius: 6px; padding: 12px 10px; font-size: 11px; min-height: 48px; display: flex; align-items: center; }
  .core-token-swatch.bg .core-token-swatch-text { text-shadow: 0 1px 3px rgba(0,0,0,.5); font-weight: 500; }
  .core-token-swatch.pill { justify-content: center; font-weight: 600; }
  .core-token-swatch.pill .core-token-swatch-text { text-shadow: 0 1px 3px rgba(0,0,0,.4); }
  .core-token-hex { font-size: 10px; opacity: .5; font-family: monospace; }

  /* ── Timestamp ─────────────────────────────────────────────────── */
  .timestamp { text-align: center; opacity: .3; font-size: 11px; padding: 24px 0; }
</style>
</head>
<body>
<div class="page">
  <h1>${theme.name}</h1>
  <div class="subtitle">${theme.type} theme — generated preview</div>

  <h2>IDE Layout</h2>
  ${uiSection(theme)}

  <h2>Widgets &amp; Controls</h2>
  ${widgetSection(theme)}

  <h2>Core UI Tokens</h2>
  ${coreTokensSection(theme)}

  <h2>Token Colors</h2>
  ${tokenTable(theme.tokens)}

  <h2>Color Palette</h2>
  ${paletteSection(theme)}

  <div class="timestamp">Generated ${new Date().toISOString()}</div>
</div>
${colorPickerScript(theme)}
</body>
</html>`;
}
