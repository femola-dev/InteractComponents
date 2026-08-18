/**
 * Writers Garden's material — Figma node 312:2975, "Line Template (Web)".
 *
 * The design is a 1440×1024 board holding one horizontal rail of twelve badge
 * tiles, a title pill above it and a caption card below. Only the tile under
 * the board's centre is drawn at full size; the rest sit at 64% of it with
 * their name pushed out of frame. That difference *is* the interaction — the
 * board is a single frame of a scroll, and this file holds the two states it
 * implies rather than the one frame it shows.
 *
 * Colours are the file's own hexes. This is the only pure-white page in the
 * playground and none of `index.css`'s tokens are tuned for it.
 */

import tulipBadge from '../assets/icons/writers-garden/tulip.svg'
import pencilBadge from '../assets/icons/writers-garden/pencil.svg'
import bloomstarBadge from '../assets/icons/writers-garden/bloomstar.svg'
import plumBadge from '../assets/icons/writers-garden/plum.svg'
import gateBadge from '../assets/icons/writers-garden/gate.svg'
import sakuraBadge from '../assets/icons/writers-garden/sakura.svg'
import sparkBadge from '../assets/icons/writers-garden/spark.svg'
import momentumIBadge from '../assets/icons/writers-garden/momentum-i.svg'
import momentumIIBadge from '../assets/icons/writers-garden/momentum-ii.svg'
import foundersBadge from '../assets/icons/writers-garden/founders.svg'
import breakthroughBadge from '../assets/icons/writers-garden/breakthrough.svg'
import adventurerBadge from '../assets/icons/writers-garden/adventurer.svg'

import iconDotGrid from '../assets/icons/writers-garden/icon-dot-grid-3x3.svg'
import iconArrowUpRight from '../assets/icons/writers-garden/icon-arrow-up-right.svg'

export { iconDotGrid, iconArrowUpRight }

/* ---- Palette ---- */

export const PAGE = '#ffffff'
/** The tile plate, and the caption card behind it. */
export const PLATE = '#fafafa'
/**
 * The giant name behind each badge.
 *
 * Figma reports the fill as transparent, so this is sampled off the board
 * instead: the darkest pixel of the blurred word is #e6e6e6 on the #fafafa
 * plate, and Chrome's blur carries a 200px stem to its full colour at the
 * core, so the two match without compensating for the blur. Far lighter than
 * it reads like it should be — it is a watermark the badge sits *on*, not a
 * heading the badge is covering up.
 */
export const GHOST = '#e6e6e6'
/** Caption body copy. The title and the link stay pure black. */
export const MUTED = '#888888'

/* ---- Geometry ----
 *
 * Every number here is the *unfocused* tile's, and the focused tile is that
 * tile times `FOCUS_SCALE`. The design draws them as two separately-sized
 * frames — 320×332 and 498×517 — but the ratio holds across every value in
 * both (radius 17.72→28, badge 230→357.66), which means the designer scaled
 * one frame rather than laying out two. So this reproduces it the same way:
 * one tile and one transform, which is also the only version of it that costs
 * nothing to animate.
 */

/** The tile's *layout* box — what it occupies in the rail, and therefore what
 *  sets the rhythm. The visual tile is bigger than this and overflows it. */
export const TILE_W = 320
export const TILE_H = 332
/** Between tiles, at rest. The focused tile grows by 89px on each side, so it
 *  expands into this gutter and never displaces its neighbours. */
export const TILE_GAP = 161
export const TILE_PITCH = TILE_W + TILE_GAP
/** The focused frame's, since that is the frame actually being drawn. The
 *  design's 17.721 on the unfocused one is this scaled down, and the tile's
 *  own transform produces it. */
export const TILE_RADIUS = 28

/**
 * The tile is *drawn* at its focused size and scaled down to rest, never laid
 * out small and scaled up.
 *
 * This is not a style preference, it is the difference between crisp and
 * blurry. A tile being transformed is promoted to its own compositor layer and
 * rasterised once at its layout size; the GPU then scales that finished bitmap.
 * Scaling a bitmap up resamples pixels that were never drawn — a 248px badge
 * stretched to 386px, which is exactly as soft as it sounds. Scaling one down
 * discards pixels instead, which is free and stays sharp.
 *
 * So the layout box above stays 320 and the drawn box below is 498, and the
 * scale runs 0.64 → 1 rather than 1 → 1.56. Same geometry on screen, opposite
 * resampling direction.
 */
export const FOCUS_W = 498
export const FOCUS_H = 517
/** 320 / 498. The height ratio is 0.6422, four tenths of a percent apart —
 *  the design's two frames are not quite the same aspect. Width wins because
 *  it is what the rail's pitch is measured against. */
export const REST_SCALE = TILE_W / FOCUS_W
/** 498 / 320, and 357.659 / 230. Kept for the values still quoted in the
 *  design against the unfocused frame. */
export const FOCUS_SCALE = 1.55625

/** The Figma badge frame, and the unit every export is normalised to. */
export const BADGE_SIZE = 230

/**
 * What the design draws the badge at inside the focused tile — Figma's
 * 357.659, which is the unfocused frame's 230 times 1.55625.
 */
export const BADGE_TARGET = 357.659

/**
 * The margin around the frame in every normalised export, in frame units, and
 * the box that produces.
 *
 * The exports do not arrive like this — they arrive cropped to rendered
 * content, each with a different box and, for nine of the twelve, an origin
 * that is not the badge frame's. Gate's sits 21.47 units above it, because its
 * shadow overhangs the frame and Figma crops to what it drew. Taking the
 * export origin for the frame origin — the obvious reading, and the one that
 * looks right on the three badges where they coincide — hangs Gate 33px high
 * once it is drawn at `BADGE_TARGET`.
 *
 * So each file is re-origined on its own frame and given this box instead: 32
 * units of margin, which clears the largest overhang in the set (Gate again,
 * 31.53 below) with nothing to spare. Uniform, so placing a badge needs no
 * per-badge numbers — which is the point, since the per-badge numbers were
 * only ever an artefact of how Figma cropped.
 */
export const BADGE_MARGIN = 32
export const BADGE_BOX = BADGE_SIZE + BADGE_MARGIN * 2

/** Frame units to focused-tile pixels. */
const BADGE_UNIT = BADGE_TARGET / BADGE_SIZE
/** The drawn size of a badge image, margin included. */
export const BADGE_IMG = BADGE_BOX * BADGE_UNIT
/** Its offset inside the focused tile — the badge centred, then backed off by
 *  the margin so the frame, not the box, is what lands centred. */
export const BADGE_IMG_X = (FOCUS_W - BADGE_TARGET) / 2 - BADGE_MARGIN * BADGE_UNIT
export const BADGE_IMG_Y = (FOCUS_H - BADGE_TARGET) / 2 - BADGE_MARGIN * BADGE_UNIT

/* ---- The ghost name ---- */

export const GHOST_SIZE = 200
export const GHOST_TRACKING = -4
export const GHOST_BLUR = 10

/**
 * Where the name sits in a focused tile, measured down from the tile's centre.
 *
 * Figma's own `top: calc(50% + 55.5px)` — so it is not centred on the tile, it
 * is slung low in it, which is what lets the badge sit on the word rather than
 * in front of it.
 */
export const GHOST_FOCUS_Y = 55.5

/**
 * How far *below that* the name rests when the tile is not focused.
 *
 * The design has the word at y=356 in an unfocused 332-tall tile — 24px past
 * the bottom edge of a tile that clips, so at rest it is not merely faint, it
 * is entirely out of frame. In the focused tile's units, which is what
 * everything here is measured in, that is 356 × 1.55625 = 554, against a
 * focused position of 314.
 *
 * So the name does not fade in, it *rises* into the frame from under the
 * plate, and at half focus a scroll catches the tops of the letters coming up.
 * That is the whole reason the tiles are `overflow: clip`.
 */
export const GHOST_REST_Y = 240

/* ---- Content ---- */

export type Badge = {
  /** Also the ghost name and the caption title. */
  name: string
  art: string
  /**
   * What the badge is for. Only Tulip's is the designer's — the file leaves
   * the other eleven at Tulip's placeholder, so these are written to its
   * pattern: one line of why it matters, one line of what earns it.
   */
  detail: string
}

/**
 * The rail, in the file's order.
 *
 * Figma names two frames "Adventurer" — the tenth and the twelfth. The twelfth
 * is the real one: its art has ADVENTURER lettered across it. So the tenth is
 * the copy-paste the file never corrected, and it carries the Founders ticket,
 * which is otherwise unused. Named accordingly here.
 */
export const BADGES: Badge[] = [
  {
    name: 'Tulip',
    art: tulipBadge,
    detail:
      'Every writer starts as a small seed with something worth saying. Begin your journey and let your first ideas bloom.',
  },
  {
    name: 'Pencil',
    art: pencilBadge,
    detail:
      'The first draft is the hardest one there is. Put ten thousand words behind you and the blank page stops being a wall.',
  },
  {
    name: 'Bloomstar',
    art: bloomstarBadge,
    detail:
      'Something you wrote found the people it was for. Awarded the week one of your pieces reaches a thousand readers.',
  },
  {
    name: 'Plum',
    art: plumBadge,
    detail:
      'Depth is its own kind of patience. Earned by carrying a single essay past four thousand words without losing the thread.',
  },
  {
    name: 'Gate',
    art: gateBadge,
    detail:
      'You held the door open for somebody else. Given when a writer you invited publishes their first piece here.',
  },
  {
    name: 'Sakura',
    art: sakuraBadge,
    detail:
      'Short season, full bloom. Thirty days of publishing without missing one, however small that day\u2019s piece was.',
  },
  {
    name: 'Spark',
    art: sparkBadge,
    detail:
      'The idea that refused to wait until morning. Awarded for a piece drafted, edited and published inside a single day.',
  },
  {
    name: 'Momentum I',
    art: momentumIBadge,
    detail:
      'Twelve weeks, twelve pieces. The first stretch where writing stops being an occasion and starts being a habit.',
  },
  {
    name: 'Momentum II',
    art: momentumIIBadge,
    detail:
      'A full year of showing up. Fifty-two weeks in a row, at which point the habit is no longer the achievement — the work is.',
  },
  {
    name: 'Founders',
    art: foundersBadge,
    detail:
      'Here before the garden had walls. Held by the first thousand writers to plant anything at all, and never issued again.',
  },
  {
    name: 'Breakthrough',
    art: breakthroughBadge,
    detail:
      'The piece that changed the shape of your audience. For a single post that outdrew everything you had written before it.',
  },
  {
    name: 'Adventurer',
    art: adventurerBadge,
    detail:
      'You wrote your way out of your own lane. Earned by publishing in five different categories without repeating yourself.',
  },
]

export const COPY = {
  title: 'Writers Garden',
  requirements: 'View Requirements',
} as const

/* ---- Shadows ----
 *
 * There is no shadow constant here, because the badge's shadow is not applied
 * in CSS — it rides in the SVG export as an ordinary filter, which is why the
 * exports are a little larger than the 230 (or 357.659) frame inside them.
 *
 * One shadow had to be taken *out* of those exports, though, and it will come
 * back with any re-export. Each badge carries a second drop shadow set to
 * Figma's `overlay` layer blend. On the canvas that composites against the
 * #fafafa plate behind the badge, which is what makes it subtle — over a plate
 * that light, an overlay of black darkens by about two levels. An isolated SVG
 * export has nothing behind it, so Figma substitutes a transparent flood and
 * the same blend collapses into an opaque dark halo: the plate 20px to the
 * left of Tulip read 199 against Figma's own 246. Deleting those primitives
 * takes the whole card from a mean error of 8.8 to 3.9 and puts that flank on
 * 246 exactly. The plain `mode="normal"` shadows — the ones the design lists
 * on the badge frame — export correctly and are kept.
 */
