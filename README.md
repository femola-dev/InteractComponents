# Playground

Interaction components, each presented inside the design's laptop/phone device
mockup. The first is a responsive article reader built from the Figma frame
"Line Template (Web)" (node `65:922`).

Vite · React · TypeScript · Tailwind CSS v4 · Framer Motion · glimm

```bash
npm install
npm run dev
```

## Pages

Each page is one entry in `src/playgrounds/registry.ts`:

```ts
{ id: 'notification-stack', label: 'Notifications', Component: NotificationStack }
```

Add an entry and the pager at the bottom of the screen picks it up — nothing
else to wire. The `id` doubles as the URL hash (`#/notification-stack`), so a
page can be linked to and survives a reload; `usePlayground` reads it back and
falls back to the first entry for an unknown hash.

`PlaygroundSwitcher` floats over the bottom of the bezel rather than reserving a
row, because the mockup deliberately bleeds off the bottom edge. Prev/next sit
at the ends with the current page's name between them, and it wraps around at
both ends. `SweepProvider` stays above the active page in `App`, so every page's
`DeviceFrame` can mount the sweep canvas.

- **Article Reader** — the Figma frame, described below
- **Notification Stack** — a stack of cards that fans out on hover (or tap) and
  dismisses on a sideways drag
- **Portfolio** — the Figma frame "Line Template (Web)" (node `147:14`), a
  portfolio performance sheet

## Article Reader layout

Three columns inside the device bezel, matching the Figma frame:

- **Left rail** — document outline minimap that fills in as you scroll
- **Center** — diagonal hatch band, then the scrollable article (612px column)
- **Right rail** — floating "Ask AI" button

Below `md` the rails collapse, the actions row wraps, and the bezel becomes a
phone-style frame with a Dynamic Island notch.

## Portfolio layout

One 748px sheet centred in the bezel: figures top-left, a currency pill and the
range tabs top-right, then the plot, its date ticks, and an insight panel with
the "Portfolio Insight" key straddling its bottom edge.

Tracks node `153:2350`. Three things carry over from the design that are easy to
lose in translation:

- **Vertical trim.** The range tabs, the change badge and the key label are set
  with `text-box-trim` in Figma, so they centre on their letterforms rather than
  their line box. That's the `.trim-cap` utility. It collapses the label's box to
  cap height, so the key's row carries the design's 22px line box itself —
  otherwise the button comes out 44px instead of 48.
- **Progressive blur.** The insight panel is 106px but holds more copy than that,
  and Figma's 67px "Progressive Blur" layer is what resolves it: the last lines
  fade instead of being clipped. It's the same frame the reader's blur comes
  from, so it reuses `<ProgressiveBlur />` rather than the flattened
  single-radius `backdrop-blur` the export hands back.
- **Stroke vs border.** Figma draws the key's stroke inside its 48px box; CSS
  adds a border on top. Hence 12px of padding where the design says 13.

Two things about the Figma node are worth knowing before reading
`src/playgrounds/Portfolio.tsx` against it:

- **The frame is horizontally flipped.** Every layer carries a counter-flip, so
  the exported `left` values are mirrored — the title block reads as `x=522` in
  the export but sits at `748 − 522 − 185 = 41` on screen. The component follows
  the rendered design, not the raw export.
- **The plot is not the Figma export.** It was a flat SVG; it is now a
  [dither-kit](https://tripwire.sh/dither-kit) `<AreaChart>`, so the range tabs
  genuinely reslice and redraw the curve. The currency chip is still
  presentational — the design has no open state for it.
- **The flag is thirteen fragments.** Figma exports the 16px US flag as a base,
  a stripe field, a canton and a star pair per column rather than one SVG.
  `src/components/FlagUs.tsx` transcribes that nesting rather than substituting a
  hand-drawn flag, so the percentage insets in it are the export's.

Figma fixes the sheet at 748×882, but the device frame is sized by the viewport,
so here it is fluid. Everything except the plot is type at a fixed size, which
makes the plot the elastic block — it takes a `clamp(180px, 30vh, 348px)` height
and the chart measures itself into it. Below roughly 600px of viewport height the
sheet stops fitting and the frame scrolls it, with the container's bottom padding
keeping the key clear of the pager.

## Chart (dither-kit)

`src/components/dither-kit/` is vendored via `npx @dither-kit/cli add
area-chart`, shadcn-style — those are our files now, tracked by
`dither-kit.json`. Installing it made this a shadcn project: `components.json`,
an `@/* → src/*` alias in `tsconfig.app.json` and `vite.config.ts`, and shadcn's
own token block appended to `index.css` (none of the house tokens were touched).
The vendored trees are in `.oxlintrc.json`'s ignore list, and `"node"` joins
`types` because the kit gates dev warnings on `process.env.NODE_ENV`.

Scrubbing the plot drives the headline: `onHoverChange` rolls the amount to the
hovered point and swaps the change line for that point's date, reverting on
leave. There is no `<Tooltip>` — the sheet's own headline is the readout, and a
floating card would say the same thing twice.

The fill splits at the scrub point: pink up to the cursor, `#BEBEBE` past it,
with the trend line left whole across the span. That needed three small changes
inside the vendored kit, which is the point of shadcn-style vendoring — they're
our files:

- `palette.ts` gains a `mute` seed (`#BEBEBE`). Deliberately separate from
  `grey`, which is darker and means "no data" rather than "not the subject".
- `paintColumn` takes an optional `bodySeed`. It painted the dither body *and*
  the top outline from one `seed`, so recolouring the fill would have recoloured
  the line with it; the body now follows `bodySeed`, the outline still follows
  `seed`.
- The canvas resolves the split column and passes `bodySeed` past it, driven by a
  new `trailColor` prop on the chart root. The split mirrors `resample`'s own
  index→column mapping rather than going through `xCenter`, whose padding would
  put the seam a pixel or two off the crosshair. `marker` is folded into
  `paintSig` so the fill actually repaints as the cursor moves — without that the
  crosshair moves and the colours stay put.

**Keep `data` referentially stable.** The chart replays its draw-on animation
whenever the identity of `data` changes (`useRevision` compares it with `!==`),
and scrubbing re-renders the page on every pointer move. An inline
`SERIES.slice(…)` therefore restarts the entrance on every mousemove — the curve
visibly redraws under the cursor. It's memoised on `range` instead, so the only
thing that moves while scrubbing is the crosshair. Same reason `CHART_MARGINS`
lives at module scope. `replayToken` is unnecessary once `data` is stable: a real
range change already changes its identity.

`RollingNumber` is the odometer behind that amount. Per-character boxes give up
two things the browser does for free, and it buys both back by measuring the live
type: letter-spacing isn't applied between atomic inlines, and kerning doesn't
cross box boundaries. It measures the string as the design sets it against the
sum of its characters boxed individually, then spreads the difference over the
boxes — the figure lands within 0.05px of the same string as static text.

The scrub seam — the boundary where the fill drops to grey — is a real damped
harmonic oscillator integrated in the canvas's own rAF loop (`F = −kx − cv`,
semi-implicit Euler substepped at 4ms). Locking it to the pointer 1:1 read as
rigid; a body of colour should have inertia. It uses the house `springResponsive`
constants (k=400, c=30, m=0.8 → ω₀ ≈ 22.4 rad/s, ζ ≈ 0.84), so it settles in
~200ms with 0.35% overshoot, and the fixed substep makes it frame-rate
independent — 30/60/120Hz are bit-identical, 90 and 144 differ by under 0.4%.
At rest it parks at the right edge, so leaving the chart lets the grey retreat
off the end instead of blinking away. The crosshair is gated on the pointer
rather than the spring: it marks where the cursor *is*, so only the shade carries
the follow-through.

The series is a fixed array, not random, so the curve is stable across renders.
Its 3M window is drawn to the silhouette of the original Figma plot; the older
weeks are a sum-of-sines walk so the longer ranges have something to show.
`variant="hatched"` echoes the diagonal hatching in the Figma plot and keeps a
solid dither fill from swamping an otherwise white sheet.

## Short viewports

The frame is pinned to the viewport, so every fixed offset above the reading
pane is height the article can never use — and the pane, as the only flexible
element, absorbs the whole loss. Left alone, browser zoom past ~150% pushed the
first line of body text under the progressive blur and then off the frame
entirely.

Two things prevent that:

- The vertical chrome (`--spacing-frame-top`, `--spacing-band-gap`,
  `--spacing-read-*` in `index.css`) is `clamp(min, vh, figma)`. It holds the
  exact Figma value at the design's height and only yields below it.
- `DeviceFrame` is `h-svh min-h-frame-floor` — an explicit height, because the
  reading pane can only scroll if its ancestors resolve to a definite one.
  Below the 560px floor the frame stops shrinking and the page scrolls instead,
  so `#root` is `min-height` rather than `height`. `svh` rather than `dvh` keeps
  the frame from resizing as mobile browser chrome hides.

At 200% zoom this takes the readable body from nothing to ~116px. Line length is
still governed by width alone, so past `md` the 613px column goes full-bleed
even on a wide window — the rails and the column cap would need height-aware
breakpoints to fix that too.

## Assets

Design exports live in `src/assets` (fonts, avatars, hatch band). The play,
pause, and pencil-AI icons are inlined as React components in
`src/components/icons.tsx` so they can inherit `currentColor` and animate
per-path; `src/assets/icons` keeps the original SVG exports as the design
source of truth. The bezel, dividers, and outline minimap are rebuilt in CSS so
they stay crisp and responsive at any width.

The original untouched Figma exports are in `Assets/` at the repo root.

The Portfolio plot and its AI glyph (`portfolio-chart.svg`, `icon-script-ai.svg`)
were pulled from the Figma MCP asset server, whose URLs expire — the files are
committed, so nothing depends on that server staying up.

## Animation

Entrance uses explicit per-block delays (`src/components/rise.ts`) rather than
Framer variants, so nested interaction animations stay independent. Listen
toggles a stacked play/pause crossfade and starts a shimmer sweep across the
hatch band; avatars spread on hover; pills and tags spring on hover/tap; the FAB
runs a slow gradient drift with a hover tooltip.

The Listen button is presentational — it does not play real audio.

## Known gap

The Figma list intro ("Responsible AI use includes several practical habits:")
is set in **Pretendard Std Bold**, but only `PretendardStd-Regular.otf` was
exported, so it renders as browser-synthesized bold. Drop
`PretendardStd-Bold.otf` into `src/assets/fonts/` and add a matching
`@font-face` (weight 700) in `src/index.css` for a true match.

Open Runde ships all four weights (`--font-figure`), so the Portfolio sheet uses
the real Semibold face.

## Page transition (glimm)

Clicking the AI pen plays a [glimm](https://www.npmjs.com/package/glimm) WebGL
sweep and swaps the reading pane between the article and an AI summary at the
band's midpoint. Clicking again sweeps back, reversed (`rtl`).

glimm's own `<GlimmProvider>` mounts its canvas as `position: fixed; inset: 0`,
which would sweep the entire browser window. To keep the transition **inside the
MacBook screen**, `src/components/sweep.tsx` drives glimm's framework-agnostic
core (`createShader` + `playSweep`) and mounts the canvas into a host rendered by
`<SweepCanvas />` inside `DeviceFrame`'s screen element — which has
`overflow: hidden` and the bezel's corner radius, so the sweep is clipped to the
mockup. At 1440×1024 the canvas measures 1136×967 inside the 1139×969 screen.

Falls back to an instant swap when WebGL is unavailable or the user prefers
reduced motion.

The context and hook live in `sweep-context.ts` so `sweep.tsx` exports only
components and stays Fast Refresh-friendly.
