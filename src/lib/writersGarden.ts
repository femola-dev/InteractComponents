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

/**
 * The requirement glyphs — node 321:23259's four, and the only four the file
 * authors.
 *
 * They are not decoration per row, they are a four-way sort, which is why four
 * is enough for forty-eight lines: identity and audience, collections and
 * counts, drafting, publishing. Every requirement in this product is one of
 * those. Scanning the column you read the shape of a badge before you read a
 * word of it — three planes means a publishing streak, a floppy at the top
 * means it starts in the editor.
 *
 * Drawn at 24 and used at 24. The project has same-family glyphs elsewhere in
 * `assets/icons` (IconClock, IconTicket, IconCalendar2) that would have widened
 * the vocabulary, but those are the 16px cuts of the set — thicker strokes for
 * their box — and mixing the two cuts in one column shows up immediately as a
 * weight mismatch between adjacent rows.
 */
import iconPeopleIdCard from '../assets/icons/writers-garden/icon-people-id-card-2.svg'
import iconLayersThree from '../assets/icons/writers-garden/icon-layers-three.svg'
import iconFloppyDisk from '../assets/icons/writers-garden/icon-floppy-disk-1.svg'
import iconPaperPlane from '../assets/icons/writers-garden/icon-paper-plane-top-right.svg'

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
/**
 * The panel's body copy — node 321:23254's own #5a5a5a, two steps darker than
 * the caption's grey and not a mistake to reconcile.
 *
 * The caption sits on a #fafafa plate on a white page; the panel sits on a
 * tinted, blurred surface about #eeeeee. Grey text needs more contrast against
 * a darker ground to read the same weight, and #888 on #eee is 3.0:1 — under
 * the 4.5 minimum for 20px body copy. #5a5a5a is 6.6:1.
 */
export const PANEL_MUTED = '#5a5a5a'

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

/**
 * Slack between the focused plate's edge and the rail's clip box.
 *
 * The plate is drawn at `FOCUS_H` and centred on a `TILE_H` layout box, so it
 * overflows its button by exactly `(FOCUS_H - TILE_H) / 2` top and bottom. The
 * rail pads by that same figure — which sounds right and is in fact the bug:
 * `overflow-y: hidden` clips at the padding box, so the plate's edges land
 * exactly *on* the clip line with nothing to spare. Every effect that moves
 * the plate vertically then cuts into it:
 *
 * - the boil, up to 1.5px, running continuously on every visible tile;
 * - the hover lift, 6px;
 * - and the hover tilt, which is the big one — `perspective(900px)` on a
 *   517-tall plate at 4° swings the near edge 258.5·sin4° ≈ 18px toward the
 *   viewer, and the projection magnifies it by 900/(900-18), pushing that edge
 *   about 4.6px past where it rests.
 *
 * It shows at the bottom first because `GHOST_FOCUS_Y` slings the name below
 * the plate's centre, so the bottom edge has glyphs against it while the top
 * edge is empty plate and can lose a pixel unnoticed.
 *
 * 16 covers all three with room over. It costs nothing but the rail's own
 * height: the row is a *row*-direction flex with `items-center`, so the
 * scroller takes its natural height and is never stretched or squeezed back.
 */
export const RAIL_BLEED = 16

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

/* ---- The requirements panel ----
 *
 * Node 318:22783, "Frame 470" — a 541×960 glass card floated over the right of
 * the 1440×1024 board, opened by the caption's "View Requirements".
 *
 * It is 32 off the top, right and bottom, which is what makes it a panel rather
 * than a drawer: it does not touch an edge, so nothing about it is anchored to
 * the viewport and every number below is a plain inset.
 */

export const PANEL_W = 541
export const PANEL_INSET = 32
export const PANEL_RADIUS = 40
/** The gutter the badge, the title, the copy and the list all start from. */
export const PANEL_PAD = 48
/** Between the badge and the title, and between every block under it — Figma's
 *  one gap for the whole column. */
export const PANEL_GAP = 40

/**
 * The panel's own fill — 7% black, and nothing else.
 *
 * That is a *tint*, not a background: at 0.07 over a white page it lands about
 * #eeeeee, which is barely darker than the #fafafa plates behind it. What
 * separates the panel from the page is not the fill, it is the blur below.
 */
export const PANEL_TINT = 'rgba(0, 0, 0, 0.07)'

/**
 * Figma's `backdrop-blur-[250px]`.
 *
 * 250 is far past the radius where a blur still resembles what it is blurring —
 * the rail behind is reduced to a wash of pink and gold with no edges left in
 * it, which is the point, because a 517px badge showing through the panel would
 * outweigh 24px type. Anything from about 80 up looks the same here; the design
 * says 250 and 250 is cheap to honour on a machine that can afford
 * `backdrop-filter` at all.
 *
 * On a machine that cannot, it is not cheap at all — a 541×960 backdrop blur is
 * a full-surface readback and re-blur per frame, and it is composited *while*
 * the panel slides. So it is gated on the same tier check the ghost name uses,
 * and tier 0/1 gets `PANEL_TINT_FLAT` instead: an opaque plate that stops the
 * rail rather than softening it. Same job, no readback.
 */
export const PANEL_BLUR = 250
export const PANEL_TINT_FLAT = '#eeeeee'

/**
 * The badge, drawn small at the panel's top-left — Figma's 100 unit frame.
 *
 * `PANEL_BADGE` is the *frame*, not the image. The exports are normalised to
 * `BADGE_BOX`, so the image drawn is proportionally larger and backed off by
 * the margin, exactly as in the rail. Below, not above, the shadow question:
 * node 318:22904 carries a CSS `drop-shadow` stack because the panel's copy of
 * the badge is an instance without the frame's own shadow. Ours is the same SVG
 * the rail uses and already carries that shadow baked in as a filter, so
 * re-applying it in CSS would double it.
 */
export const PANEL_BADGE = 100

/** Frame units to panel pixels — the rail's `BADGE_UNIT`, at 100 instead of
 *  357.659. */
const PANEL_BADGE_UNIT = PANEL_BADGE / BADGE_SIZE
/** The drawn size of the panel's badge image, margin included, and the offset
 *  that puts the *frame* — not the box — at the panel's 48px gutter. */
export const PANEL_BADGE_IMG = BADGE_BOX * PANEL_BADGE_UNIT
export const PANEL_BADGE_OFFSET = -BADGE_MARGIN * PANEL_BADGE_UNIT

/* ---- The spin ----
 *
 * While the panel is open the badge turns about its vertical axis, rendered on
 * a WebGL quad rather than transformed in CSS. See `SpinningBadge`. Everything
 * below is the geometry that keeps the *resting* frame identical to the static
 * image above it, so the swap between the two is invisible.
 */

/**
 * How much bigger the canvas is than the badge it draws.
 *
 * A rotating quad never gets wider than it starts — it foreshortens — but under
 * perspective the edge nearest the camera is magnified, and at the moment the
 * badge is side-on that near edge is the full height of it. The magnification
 * there is `SPIN_DISTANCE / (SPIN_DISTANCE - 1)`, so at a camera six half-heights
 * back the sliver is 1.2× the resting height — 88.9% of the canvas, against the
 * 74.1% it rests at. Horizontally the peak is a mere 1.01× (at 9.6°, where
 * `sin θ = 1 / SPIN_DISTANCE`), so height is what sets this. 1.35 clears 1.2
 * with room for the shadow the export carries.
 */
export const SPIN_HEADROOM = 1.35

/** The canvas's CSS box, and the offset that centres it on the badge frame. */
export const PANEL_BADGE_STAGE = PANEL_BADGE_IMG * SPIN_HEADROOM
export const PANEL_BADGE_STAGE_OFFSET =
  PANEL_BADGE / 2 - PANEL_BADGE_STAGE / 2

/**
 * Camera distance in quad half-heights, and the focal length that follows.
 *
 * These are one decision, not two: the quad is one unit tall, so its projected
 * half-height is `focal / distance`, and that has to come out at exactly
 * `1 / SPIN_HEADROOM` for the badge to rest at the same size the static image
 * draws it. Fixing the distance therefore fixes the focal length, and with it
 * the field of view — 6 gives about 25°, which is enough perspective to read as
 * depth and not so much that the near edge bulges.
 */
export const SPIN_DISTANCE = 6
export const SPIN_FOCAL = SPIN_DISTANCE / SPIN_HEADROOM

/**
 * Seconds per revolution.
 *
 * 7 is a display turn, not a spinner: about 51°/s, so the badge is legible for
 * most of the cycle and passes through side-on quickly enough that the moment
 * it has no width reads as a flash rather than a gap. Under 4s it starts to
 * look like a loading state; past about 12s the eye stops registering it as
 * motion at all and it just seems to drift.
 */
export const SPIN_PERIOD = 7

/** How long the turn takes to reach full speed, via GSAP's `timeScale`. It
 *  starts from rest as the panel arrives rather than already at 51°/s, which
 *  would read as a jump-cut against a panel that is still travelling. */
export const SPIN_RAMP = 0.9

/**
 * The reverse of the badge.
 *
 * All twelve are struck with the same gold rim, so the back is that rim's metal
 * rather than a neutral grey — a badge whose edge is gold and whose reverse is
 * pewter reads as two objects. Mid-tone on purpose: the shader multiplies it by
 * 0.80–1.08 depending on which way the back is facing, and a value near white
 * would clip flat at the top of that range and lose the turn.
 */
export const PANEL_BADGE_BACK = '#c2a35c'

/* ---- The helix ----
 *
 * The vertical layout winds the twelve badges up a double helix built to
 * B-DNA's own numbers. Working units below are *badge half-heights*: the badge
 * is 2 units tall and 2 wide, which is the same convention `SpinningBadge`
 * uses, so both renderers agree on what "1" means.
 *
 * B-DNA, measured (Watson–Crick / Drew–Dickerson, the canonical fibre and
 * crystal values):
 *
 *   helical twist   34.3° per base pair   → 10.5 base pairs per turn
 *   rise             3.32 Å per base pair
 *   radius          10 Å                  → the familiar 20 Å diameter
 *   strand offset  ~120°                  → the major and minor grooves
 *
 * Two of those four are used literally and two are scaled, and it is worth
 * being exact about which. The twist and the strand offset are the *angular*
 * facts about DNA — they are what the shape looks like — and they are used
 * untouched. The rise is scaled, because it has to be: see `HELIX_RISE`.
 */

/** B-DNA's helical twist per base pair, in radians. One badge is one base. */
export const HELIX_TWIST = (34.3 * Math.PI) / 180

/**
 * The angle between the two backbones, in radians.
 *
 * 120°, and emphatically not 180°. Two strands placed exactly opposite would
 * give a helix with two identical grooves; B-DNA's are famously *unequal* — a
 * wide major groove of about 22 Å and a narrow minor one of about 12 Å — and
 * that asymmetry is a direct consequence of the glycosidic bonds sitting off to
 * one side of the base pair rather than across its diameter. It is also the
 * single detail that makes a drawing read as DNA instead of as two generic
 * intertwined spirals, so it is the last thing that should be rounded off.
 */
export const HELIX_STRAND_OFFSET = (120 * Math.PI) / 180

/** Distance from the axis to a backbone, in badge half-heights. */
export const HELIX_RADIUS = 2.4

/** B-DNA's own rise-to-radius ratio, 3.32 Å / 10 Å. */
export const DNA_RISE_RATIO = 3.32 / 10

/**
 * How much the rise is stretched past the molecule's, and why it has to be.
 *
 * At B-DNA's true proportions a base pair is 3.32 Å thick on a 20 Å diameter —
 * the plates are stacked about six times closer than they are wide, which is
 * exactly why the molecule looks solid rather than like a spiral staircase. Ask
 * twelve badges to stack that way and they overlap by around 60%: a beautiful
 * dense coil in which not one badge is legible.
 *
 * So this is the one place the molecule is overruled by the fact that the
 * things on it have to be read. 2.9 puts the rise at 2.31 units against a badge
 * 2 tall, so consecutive badges clear each other with a little air. Everything
 * angular stays real; only the spacing along the axis is stretched, which is
 * the parameter a reader is least able to check by eye and the one the layout
 * most depends on.
 */
export const HELIX_RISE_STRETCH = 2.9
export const HELIX_RISE = HELIX_RADIUS * DNA_RISE_RATIO * HELIX_RISE_STRETCH

/**
 * Camera distance and vertical field of view.
 *
 * These two settle a straight conflict, and it is worth naming it rather than
 * pretending the numbers were free. How big the focused badge is goes as
 * `1 / ((D − R) · tan(fov/2))`; how much of the helix is in frame goes as
 * `D · tan(fov/2)`. Both are governed by the same tangent, in opposite
 * directions — a lens tight enough to make the front badge as large as the
 * horizontal rail's 358px leaves 0.96 pitches in frame, which is one badge and
 * two slivers, and at that point the helix has no shape to see.
 *
 * So the badge gives way, because the structure is the reason this layout
 * exists. At D = 9 and a 40° vertical field the frame holds ±1.42 pitches —
 * the focused badge with a neighbour above and below — and the focused badge
 * lands around 300px in the ~730px the rail area gets on a 1024-tall window.
 * Smaller than the horizontal rail's, and it should be: there, one tile is the
 * whole subject.
 *
 * Pulling the camera in to 9 rather than holding it back also widens the
 * near-to-far size ratio across the helix from 1.56 to 1.73, which is free
 * depth — the far badges read as further away rather than merely smaller.
 */
export const HELIX_CAMERA_DISTANCE = 9
export const HELIX_FOV = (40 * Math.PI) / 180

/** Where on the circle a badge faces the camera. The camera sits on +Z, and a
 *  badge's face normal is its own radial direction, so it looks straight down
 *  the lens at a quarter turn. */
export const HELIX_FRONT_PHASE = Math.PI / 2

/**
 * Distance at which the far side of the helix has faded fully into the page.
 *
 * The page is white, so depth is cued by *losing contrast* rather than by going
 * dark — the far strand and the badges on it wash out toward the background the
 * way anything does through a depth of air. The near bound is the closest a
 * badge ever gets (`HELIX_CAMERA_DISTANCE − HELIX_RADIUS`), so the focused one
 * is never touched by it.
 */
export const HELIX_FOG_NEAR = HELIX_CAMERA_DISTANCE - HELIX_RADIUS
export const HELIX_FOG_FAR = HELIX_CAMERA_DISTANCE + HELIX_RADIUS * 4.4

/**
 * The backbone and the base-pair rungs: colour, half-width and opacity.
 *
 * The colour is a desaturated version of the gold every badge is rimmed with,
 * so the structure belongs to the things hanging off it.
 *
 * The width is a *half*-width in world units, and world units here are badge
 * half-heights — so it needs converting before it means anything. The focused
 * badge is around 300px tall on a 1024-tall window, which puts one unit at
 * ~150px, which makes this ribbon 2 × 0.022 × 150 ≈ 6.6px at the front of the
 * helix and thinner as it recedes. That is a drawn line; at the 0.055 it
 * started from it was a 16px band competing with the badges.
 */
export const HELIX_STRAND_COLOR = '#b9ad8e'
export const HELIX_STRAND_WIDTH = 0.022
export const HELIX_STRAND_ALPHA = 0.55
export const HELIX_RUNG_ALPHA = 0.3

/* ---- The card, on the helix ----
 *
 * The helix carries the whole plate, not a bare badge: the same #fafafa card at
 * the same 498×517 with the same 28px corners, the ghost name rising behind it,
 * the shimmer sweeping across it, the pointer glow, and the focus scale. All of
 * which used to be CSS on a DOM tile and now has to be a shader, because the
 * tile is a textured quad in a 3D scene.
 *
 * World units stay what they were — the card is 2 units tall, so `HELIX_RISE`
 * and `HELIX_RADIUS` carry over untouched. It is only the *aspect* that changes,
 * because a card is not square where a badge was.
 */

/** Card half-width, with half-height fixed at 1. */
export const HELIX_CARD_ASPECT = FOCUS_W / FOCUS_H

/**
 * The pointer tilt, in radians, and the lift.
 *
 * The rail's own 4° and 6°, kept rather than re-tuned: the helix should feel
 * like the same object under the cursor as the rail does. The lift converts
 * from the rail's 6px — on a card 517 design-pixels tall that is 6/517 of a
 * half-card, and a half-card is 1 world unit.
 */
export const HELIX_TILT_X = (4 * Math.PI) / 180
export const HELIX_TILT_Y = (6 * Math.PI) / 180
export const HELIX_LIFT = (6 / FOCUS_H) * 2

/**
 * The ghost name's texture, and why it is taller than the card.
 *
 * The word does not fade in, it rises — `GHOST_REST_Y` below its focused
 * position when the card is cold, sliding up as the card takes focus. Baking it
 * at one position and sliding the *sampling window* is what reproduces that, and
 * that window has to have somewhere to slide from: the texture spans the card
 * plus the full travel, with the word painted `GHOST_REST_Y` down from the top,
 * so a cold card samples the empty band above it and a focused one samples the
 * word.
 *
 * Baked at a fraction of card resolution because it is blurred by
 * `GHOST_BLUR` before anything ever sees it — a 10px gaussian on a 200px glyph
 * destroys far more detail than halving the raster does, so the extra texels
 * would be spent rendering something that is then thrown away.
 */
export const GHOST_TEX_SPAN = FOCUS_H + GHOST_REST_Y
export const GHOST_TEX_SCALE = 0.5

/* ---- The vertical rail ---- */

/**
 * Scroll distance per badge, in CSS pixels.
 *
 * Shorter than the horizontal rail's 481px pitch on purpose: a wheel notch is
 * ~100px and vertical is the axis it was built for, so the same pitch that
 * feels deliberate sideways feels like wading downward.
 */
export const VERTICAL_PITCH = 260

/**
 * The spring that carries the helix from one badge to the next.
 *
 * Not an easing curve — a damped harmonic oscillator, solved exactly, in
 * `src/lib/spring.ts`. What it acts on is the *continuous badge index*: the
 * scroller writes where the scroll actually is, this trails it with mass, and
 * the phase and camera height are both derived from the result. One scalar of
 * state, so the rotation and the rise can never disagree about where the helix
 * is.
 *
 * ω = 2π × 1.2 rad/s and ζ = 0.62 give, by the formulas in that file:
 *
 *   overshoot     exp(−πζ/√(1−ζ²))  =  8.4% of the step
 *   settling time 4 / ζω            =  0.86 s
 *
 * The overshoot is the part worth having. A flick of three badges over-rotates
 * by 0.084 × 3 × 34.3° ≈ 8.6° and winds back — the helix carries momentum past
 * the mark and unwinds into place, which is what a heavy thing on a spring
 * does. Pushed under about ζ = 0.5 it visibly bounces twice and starts to read
 * as a loose mechanism rather than a weighted one.
 */
export const HELIX_OMEGA = 2 * Math.PI * 1.2
export const HELIX_ZETA = 0.62

export const LAYOUTS = {
  horizontal: 'Rail',
  vertical: 'Helix',
} as const

export type LayoutMode = keyof typeof LAYOUTS

/* ---- Content ---- */

export type Requirement = {
  /** One of the four glyphs above. */
  icon: string
  label: string
}

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
  /**
   * The panel's first line, above `detail` and in the same paragraph block.
   *
   * Figma runs the two together in one text node — a short line naming the
   * feeling, then the longer one already on the caption. Held apart here
   * because only the second is shared with the caption card.
   */
  tagline: string
  /**
   * What actually earns the badge. Four rows, like the design's, and four
   * everywhere: the list is a fixed shape, so the panel's height does not
   * lurch as the rail moves under it.
   *
   * Tulip's four are the designer's, minus the "Publish or  your first
   * article" typo in node 321:23268. The other forty-four are written to the
   * same shape — imperative, one clause, no punctuation — for the same reason
   * `detail` was.
   */
  requirements: Requirement[]
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
    tagline: 'Your first little bloom in the garden',
    detail:
      'Every writer starts as a small seed with something worth saying. Begin your journey and let your first ideas bloom.',
    requirements: [
      { icon: iconPeopleIdCard, label: 'Create a profile' },
      { icon: iconLayersThree, label: 'Choose at least 3 reading interests' },
      { icon: iconFloppyDisk, label: 'Save your first article draft' },
      { icon: iconPaperPlane, label: 'Publish your first article' },
    ],
  },
  {
    name: 'Pencil',
    art: pencilBadge,
    tagline: 'Ten thousand words behind you',
    detail:
      'The first draft is the hardest one there is. Put ten thousand words behind you and the blank page stops being a wall.',
    requirements: [
      { icon: iconFloppyDisk, label: 'Save 10,000 words across your drafts' },
      { icon: iconLayersThree, label: 'Carry five drafts at once' },
      { icon: iconPaperPlane, label: 'Publish three of them' },
      { icon: iconPeopleIdCard, label: 'Answer one reader on each' },
    ],
  },
  {
    name: 'Bloomstar',
    art: bloomstarBadge,
    tagline: 'The week the room filled up',
    detail:
      'Something you wrote found the people it was for. Awarded the week one of your pieces reaches a thousand readers.',
    requirements: [
      { icon: iconPaperPlane, label: 'Publish a piece to your followers' },
      { icon: iconPeopleIdCard, label: 'Reach 1,000 readers in seven days' },
      { icon: iconLayersThree, label: 'Rank in any one category that week' },
      { icon: iconFloppyDisk, label: 'Leave the piece live and unedited' },
    ],
  },
  {
    name: 'Plum',
    art: plumBadge,
    tagline: 'One long thought, carried the distance',
    detail:
      'Depth is its own kind of patience. Earned by carrying a single essay past four thousand words without losing the thread.',
    requirements: [
      { icon: iconFloppyDisk, label: 'Save one draft past 4,000 words' },
      { icon: iconLayersThree, label: 'Break it into five or more sections' },
      { icon: iconPaperPlane, label: 'Publish it whole, not as a series' },
      { icon: iconPeopleIdCard, label: 'Hold 50 readers to the last line' },
    ],
  },
  {
    name: 'Gate',
    art: gateBadge,
    tagline: 'You held the door open',
    detail:
      'You held the door open for somebody else. Given when a writer you invited publishes their first piece here.',
    requirements: [
      { icon: iconPeopleIdCard, label: 'Send an invite from your profile' },
      { icon: iconLayersThree, label: 'Have that invite accepted' },
      { icon: iconFloppyDisk, label: 'See them save a first draft' },
      { icon: iconPaperPlane, label: 'See them publish it' },
    ],
  },
  {
    name: 'Sakura',
    art: sakuraBadge,
    tagline: 'Short season, full bloom',
    detail:
      'Short season, full bloom. Thirty days of publishing without missing one, however small that day\u2019s piece was.',
    requirements: [
      { icon: iconPaperPlane, label: 'Publish on 30 days running' },
      { icon: iconFloppyDisk, label: 'Save something every one of them' },
      { icon: iconLayersThree, label: 'Cover at least three categories' },
      { icon: iconPeopleIdCard, label: 'Miss no day, however small' },
    ],
  },
  {
    name: 'Spark',
    art: sparkBadge,
    tagline: 'The idea that refused to wait',
    detail:
      'The idea that refused to wait until morning. Awarded for a piece drafted, edited and published inside a single day.',
    requirements: [
      { icon: iconFloppyDisk, label: 'Start a draft from an empty page' },
      { icon: iconLayersThree, label: 'Take it through three revisions' },
      { icon: iconPaperPlane, label: 'Publish before the day is out' },
      { icon: iconPeopleIdCard, label: 'Find 100 readers in the first week' },
    ],
  },
  {
    name: 'Momentum I',
    art: momentumIBadge,
    tagline: 'Twelve weeks, twelve pieces',
    detail:
      'Twelve weeks, twelve pieces. The first stretch where writing stops being an occasion and starts being a habit.',
    requirements: [
      { icon: iconPaperPlane, label: 'Publish once a week for 12 weeks' },
      { icon: iconLayersThree, label: 'Never twice in a row in one category' },
      { icon: iconFloppyDisk, label: 'Keep a draft open the whole time' },
      { icon: iconPeopleIdCard, label: 'Answer every reader who writes in' },
    ],
  },
  {
    name: 'Momentum II',
    art: momentumIIBadge,
    tagline: 'A full year of showing up',
    detail:
      'A full year of showing up. Fifty-two weeks in a row, at which point the habit is no longer the achievement \u2014 the work is.',
    requirements: [
      { icon: iconPeopleIdCard, label: 'Hold Momentum I already' },
      { icon: iconPaperPlane, label: 'Publish once a week for 52 weeks' },
      { icon: iconLayersThree, label: 'Cover at least eight categories' },
      { icon: iconFloppyDisk, label: 'Save 100,000 words along the way' },
    ],
  },
  {
    name: 'Founders',
    art: foundersBadge,
    tagline: 'Here before the garden had walls',
    detail:
      'Here before the garden had walls. Held by the first thousand writers to plant anything at all, and never issued again.',
    requirements: [
      { icon: iconPeopleIdCard, label: 'Join in the first thousand' },
      { icon: iconFloppyDisk, label: 'Save a draft in your first week' },
      { icon: iconPaperPlane, label: 'Publish before the doors opened' },
      { icon: iconLayersThree, label: 'Never issued again after launch' },
    ],
  },
  {
    name: 'Breakthrough',
    art: breakthroughBadge,
    tagline: 'The piece that changed your shape',
    detail:
      'The piece that changed the shape of your audience. For a single post that outdrew everything you had written before it.',
    requirements: [
      { icon: iconPaperPlane, label: 'Publish a piece to your followers' },
      { icon: iconPeopleIdCard, label: 'Outdraw your best by five times' },
      { icon: iconLayersThree, label: 'Chart in three categories at once' },
      { icon: iconFloppyDisk, label: 'Leave it standing for 30 days' },
    ],
  },
  {
    name: 'Adventurer',
    art: adventurerBadge,
    tagline: 'You wrote your way out of your lane',
    detail:
      'You wrote your way out of your own lane. Earned by publishing in five different categories without repeating yourself.',
    requirements: [
      { icon: iconLayersThree, label: 'Publish in five categories' },
      { icon: iconPaperPlane, label: 'One piece each, none repeated' },
      { icon: iconFloppyDisk, label: 'Save 2,000 words in every one' },
      { icon: iconPeopleIdCard, label: 'Pick up readers in all five' },
    ],
  },
]

export const COPY = {
  title: 'Writers Garden',
  /** The trigger's label. It does not change when the panel is open — the
   *  underline stays, `aria-expanded` carries the state, and a label that
   *  flipped to "Hide" would move the caption's baseline every time. */
  requirements: 'View Requirements',
  /** The panel is a dialog and needs a name; its own heading is the badge, so
   *  this is the accessible one. */
  panelLabel: (name: string) => `${name} badge requirements`,
  close: 'Close',
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
