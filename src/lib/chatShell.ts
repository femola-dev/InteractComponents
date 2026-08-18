/**
 * The Chat View's material — Figma node 308:454, "Conversation Web".
 *
 * Split out of the playground because the app rail switches between five
 * destinations that all share this shell: the same ink, the same chip, the same
 * carved dividers, the same placeholder fills. The components that draw with
 * these live in `components/ChatShell.tsx`; the values are here so a file can
 * import one without importing the other.
 */

/* Söhne's stylistic alternates — the single-storey `a` and straight-tailed `l`
   the design's labels are set with. */
export const SALT = { fontFeatureSettings: '"salt" 1' } as const

export const INK = '#212c46'
export const MUTED = '#7f869d'
export const HAIRLINE = '#d5d9e7'
export const CHIP = '#eef0f7'
export const CHIP_RING = 'rgba(202,206,223,0.4)'

/** The 0.5px hairline every card and chip in the design is drawn with. */
export const RING = `inset 0 0 0 0.5px ${CHIP_RING}`

/* A 1px rule with a white line under it: the design carves its dividers into
   the #f8f9fd canvas rather than drawing them on top, and the highlight is what
   sells the groove. The vertical rule at x=267 deliberately has none. */
export const GROOVE = '0px 1px 0px 0px rgba(255,255,255,0.8)'

export const RAIL_SHADOW =
  '0px 2px 8px -2px rgba(0,14,43,0.08), 0px 0px 1px 0px rgba(131,138,152,0.1), 0px 1px 2px 0px rgba(0,14,43,0.1)'

/* Placeholder fills. The base reuses the sidebar's chip so ghost content reads
   as the same material as the rest of the app; the deep one is one step further
   in, and carries every "this is the active/filled part" distinction the ghosts
   make — the sent bubble, the send button, the bar that has value in it. */
export const GHOST_IN = CHIP
export const GHOST_OUT = '#e2e7f4'

/**
 * The same pair, quieter — what the rail's ghost frames are drawn in.
 *
 * Both are mixed 60/40 toward the #f8f9fd canvas, so the tint and the two tones'
 * relationship survive at roughly 60% of the contrast. A chat thread is a dozen
 * bubbles on an otherwise empty pane; a dashboard or a settings page is
 * placeholder edge to edge, and that much fill at the conversation's strength
 * stops reading as absence and starts reading as content.
 */
export const GHOST_SOFT = '#f2f4fa'
export const GHOST_SOFT_DEEP = '#ebeef8'

/** The hairline on a ghost surface, softened by the same hand. */
export const GHOST_SOFT_RING = 'inset 0 0 0 0.5px rgba(202,206,223,0.28)'
