/**
 * Get Started — Figma node 344:4987 ("Slide 16:9 - 8").
 *
 * Everything the board draws that isn't layout: the two nav stacks, the four
 * onboarding rows, and the three help tiles. Kept out of the component for the
 * same reason `conversations.ts` is — the page is one long artboard, and the
 * copy is the part most likely to change without the geometry moving.
 *
 * Every glyph is the asset Figma exported, committed under
 * `assets/icons/get-started/`. None of them are redrawn by hand: the file's
 * vectors are the design.
 */

import iconSidebarToggle from '../assets/icons/get-started/sidebar-toggle.svg'
import iconRocket from '../assets/icons/get-started/rocket.svg'
import iconWebPage from '../assets/icons/get-started/web-page.svg'
import iconGridSearch from '../assets/icons/get-started/grid-search.svg'
import iconMultitasking from '../assets/icons/get-started/multitasking.svg'
import iconVideo from '../assets/icons/get-started/video.svg'
import iconChat from '../assets/icons/get-started/chat.svg'
import iconDocument from '../assets/icons/get-started/document.svg'
import iconDisplay4k from '../assets/icons/get-started/display-4k.svg'
import iconCloudWifi from '../assets/icons/get-started/cloud-wifi.svg'
import iconColorPalette from '../assets/icons/get-started/color-palette.svg'
import iconUpGraph from '../assets/icons/get-started/up-graph.svg'
import iconGift from '../assets/icons/get-started/gift.svg'
import iconPreferences from '../assets/icons/get-started/preferences.svg'
import iconUpdateSquare from '../assets/icons/get-started/update-square.svg'
import iconThumbLike from '../assets/icons/get-started/thumb-like-square.svg'
import iconMacLaptop from '../assets/icons/get-started/mac-laptop.svg'
import iconHappyAdd from '../assets/icons/get-started/happy-add.svg'
import iconCloudUpload from '../assets/icons/get-started/cloud-upload.svg'
import iconFire from '../assets/icons/get-started/fire.svg'
import iconCheckCircle from '../assets/icons/get-started/check-circle.svg'
import iconLoading from '../assets/icons/get-started/loading.svg'

// The selected cut of every rail glyph, from node 351:7267 — the board that
// draws the whole nav in its active state. Same vectors and same artboards as
// the resting set, filled #171717 instead of #919191, so the insets below are
// shared between the two.
import activeRocket from '../assets/icons/get-started/active/rocket.svg'
import activeWebPage from '../assets/icons/get-started/active/web-page.svg'
import activeGridSearch from '../assets/icons/get-started/active/grid-search.svg'
import activeMultitasking from '../assets/icons/get-started/active/multitasking.svg'
import activeVideo from '../assets/icons/get-started/active/video.svg'
import activeChat from '../assets/icons/get-started/active/chat.svg'
import activeDocument from '../assets/icons/get-started/active/document.svg'
import activeDisplay4k from '../assets/icons/get-started/active/display-4k.svg'
import activeCloudWifi from '../assets/icons/get-started/active/cloud-wifi.svg'
import activeColorPalette from '../assets/icons/get-started/active/color-palette.svg'
import activeUpGraph from '../assets/icons/get-started/active/up-graph.svg'
import activeGift from '../assets/icons/get-started/active/gift.svg'
import activePreferences from '../assets/icons/get-started/active/preferences.svg'
import activeUpdateSquare from '../assets/icons/get-started/active/update-square.svg'
import activeThumbLike from '../assets/icons/get-started/active/thumb-like-square.svg'

import tileGuide from '../assets/icons/get-started/tile-guide.svg'
import tileSupport from '../assets/icons/get-started/tile-support.svg'
import tileCommunity from '../assets/icons/get-started/tile-community.svg'

export { iconSidebarToggle, iconCheckCircle, iconLoading }

/** The artboard. Reproduced at its own scale and fitted to the window. */
export const STAGE = { width: 1470, height: 1080 } as const

/** Every flat colour in the board, named once. */
export const INK = '#171717'
export const MUTED = '#737373'
export const HAIRLINE = '#ededed'
export const CANVAS = '#fbfafa'
/** The lit nav row. Darker than `HAIRLINE` — it has to read against #fbfafa. */
export const SELECTED = '#e8e8e8'


/**
 * The placeholder pair, for the destinations the file never drew.
 *
 * Two tones and not one, on `chatShell`'s rule: `GHOST_DEEP` is the filled tone,
 * standing in for the things that carry value — an accent disc, a row's title —
 * and `GHOST` is everything else. That one step of contrast is the only thing
 * giving a ghost frame internal hierarchy, so a placeholder still reads as a
 * *shape of a page* rather than as a grid of identical bars.
 *
 * Neutral where `chatShell`'s equivalents are cool, because this shell is white
 * and #ededed rather than #f8f9fd. Same 8-point separation between them.
 */
export const GHOST = '#f1f1f1'
export const GHOST_DEEP = '#e9e9e9'

/**
 * The card's elevation, as one declaration.
 *
 * Figma draws the 1px #ededed edge as an *inside* stroke: the frame is 515 wide
 * and its first child is also 515 wide, starting at x=0. A real CSS `border`
 * would eat two pixels of that and shift every row's 20px inset to 21. An inset
 * ring paints in the same place without taking part in the box model, so the
 * content box stays exactly the width the design measured.
 */
export const CARD_SHADOW = [
  '0px 2px 4px rgba(0, 14, 43, 0.08)',
  '0px 0px 1px rgba(0, 14, 43, 0.1)',
  '0px 1px 1px rgba(0, 14, 43, 0.1)',
  `inset 0 0 0 1px ${HAIRLINE}`,
].join(', ')

/**
 * Some glyphs are exported smaller than the 16px box they sit in — Figma trims
 * the artboard to the vector's own bounds. Re-inflating them to fill the box
 * would draw them oversized, so those three carry the inset the file specifies
 * and the rest fill their box.
 */
export type Glyph = { src: string; inset?: string }

/**
 * The shape a destination's page would take, for the frames the file never drew.
 *
 * Eight archetypes rather than fourteen bespoke layouts, and rather than one
 * shared layout. Fourteen would be invention dressed as specification — the
 * board says nothing about these pages, so any detail beyond what the name
 * implies is a guess with no source. One would be worse in the other direction:
 * a placeholder that looks identical everywhere teaches the reader that the nav
 * does nothing.
 *
 * What a name *does* license is the coarse shape of its content, and that is
 * exactly what these encode. A vault of documents is a table whatever it holds;
 * a player is a stage with a queue under it. Destinations that share a shape
 * share a frame, which is a claim the names actually support.
 */
export type GhostLayout =
  /** Stat tiles over a chart — a dashboard. */
  | 'stats'
  /** A gallery of cards, for browsing a set. */
  | 'grid'
  /** Rows carrying an avatar or icon, a title and a line of detail. */
  | 'list'
  /** Dense rows in shared columns, under a header strip. */
  | 'table'
  /** A stage with a scrubber and a queue. */
  | 'media'
  /** One big meter and the breakdown under it. */
  | 'meter'
  /** Labelled rows with a control on the right. */
  | 'settings'
  /** Fields, a long input, and a button. */
  | 'form'

export type NavItem = {
  label: string
  /** The resting cut, filled #919191. */
  icon: Glyph
  /** The selected cut, filled #171717 — the same ink as the lit label. */
  activeIcon: Glyph
  /** The red bead the Updates row carries. */
  badge?: boolean
  /** Absent on Get Started alone — the one page the board specifies. */
  ghost?: GhostLayout
}

/**
 * Both cuts of one glyph, sharing an inset.
 *
 * The two exports are the same vectors on the same artboards and differ only in
 * fill, so a glyph trimmed to its bounds in one state is trimmed identically in
 * the other. Declaring the inset once is what guarantees the icon cannot shift
 * by a sub-pixel as it swaps.
 */
const pair = (rest: string, selected: string, inset?: string) => ({
  icon: { src: rest, inset },
  activeIcon: { src: selected, inset },
})

/** The three stacks above the fold, separated by hairlines. */
export const NAV_SECTIONS: NavItem[][] = [
  [
    // No resting cut exists for this one: Get Started is the selected row on
    // every board in the file, so the grey rocket was never drawn. Both states
    // point at the dark cut until one is.
    { label: 'Get Started', ...pair(iconRocket, activeRocket) },
    { label: 'Overview', ...pair(iconWebPage, activeWebPage), ghost: 'stats' },
    { label: 'Explorer', ...pair(iconGridSearch, activeGridSearch), ghost: 'grid' },
    { label: 'Playground', ...pair(iconMultitasking, activeMultitasking), ghost: 'grid' },
  ],
  [
    {
      label: 'Events',
      ...pair(iconVideo, activeVideo, '19.04% 5.84% 19.08% 5.83%'),
      ghost: 'list',
    },
    {
      label: 'Chat Rooms',
      ...pair(iconChat, activeChat, '13.15% 11.46% 13.14% 11.45%'),
      ghost: 'list',
    },
    { label: 'Doc Vault', ...pair(iconDocument, activeDocument), ghost: 'table' },
    { label: 'Media Player', ...pair(iconDisplay4k, activeDisplay4k), ghost: 'media' },
    { label: 'Cloud Storage', ...pair(iconCloudWifi, activeCloudWifi), ghost: 'meter' },
  ],
  [
    { label: 'Appearance', ...pair(iconColorPalette, activeColorPalette), ghost: 'settings' },
    { label: 'Reports', ...pair(iconUpGraph, activeUpGraph), ghost: 'stats' },
    { label: 'Referrals', ...pair(iconGift, activeGift), ghost: 'table' },
  ],
]

/** The stack pinned to the bottom of the rail. */
export const NAV_FOOTER: NavItem[] = [
  { label: 'Settings', ...pair(iconPreferences, activePreferences), ghost: 'settings' },
  {
    label: 'Updates',
    ...pair(iconUpdateSquare, activeUpdateSquare),
    badge: true,
    ghost: 'list',
  },
  { label: 'Feedback', ...pair(iconThumbLike, activeThumbLike), ghost: 'form' },
]

/** Every destination in rail order, for looking one up by its label. */
export const DESTINATIONS: NavItem[] = [...NAV_SECTIONS.flat(), ...NAV_FOOTER]

export const destination = (label: string) =>
  DESTINATIONS.find(d => d.label === label) ?? DESTINATIONS[0]

export type Step = {
  id: string
  title: string
  /** Absent on the first row, which the design draws as a single line. */
  description?: string
  icon: Glyph
  /** The badge disc behind the glyph. */
  accent: string
  /** Ships already ticked. */
  done?: boolean
}

export const STEPS: Step[] = [
  {
    id: 'workspace',
    title: 'Workspace created',
    icon: { src: iconMacLaptop },
    accent: '#42b61a',
    done: true,
  },
  {
    id: 'personalize',
    title: 'Start personalizing your workspace',
    description: 'Add users, define roles, and personalize your workspace settings.',
    icon: { src: iconHappyAdd, inset: '18.75% 17.5%' },
    accent: '#007aff',
  },
  {
    id: 'data',
    title: 'Connect Your Data',
    description: 'Link external tools or import your existing data to get a head start.',
    icon: { src: iconCloudUpload },
    accent: '#7a03e9',
  },
  {
    id: 'discover',
    title: 'Discover amazing features and adds-on',
    description: 'Explore incredible features and add-ons by connecting with app explorer.',
    icon: { src: iconFire },
    accent: '#ff0000',
  },
]

/**
 * The badge cluster breaking out over the card's top-right corner — three copies
 * of the mark at the sizes and offsets the file gives them (nodes 344:5178,
 * 344:5182, 344:5186, placed inside Frame 168 at 429, 22).
 *
 * They also run as a gear train, and only the flower inside each plate turns:
 * the flower is already a cog — eight lobes around a hub — while the rounded
 * blue square is the housing, and a spinning rounded square reads as a glitch.
 *
 * Two things make it read as a mechanism rather than three separate spinners:
 *
 * **Speed.** Meshed gears sharing a tooth pitch turn at a rate inversely
 * proportional to diameter, so the *period* is proportional to it. The largest
 * plate sets the tempo in `GEAR_PERIOD` and the other two are scaled off it,
 * which is why they are not listed here — deriving them keeps the ratio true if
 * the tempo is ever retuned.
 *
 * **Direction.** The large plate drives the two small ones, so both turn against
 * it. That the two small ones don't also drive each other is what makes the
 * train solvable at all: three mutually-meshed gears form an odd cycle, and an
 * odd cycle cannot alternate direction consistently. One driver and two
 * followers can.
 */
export type Gear = {
  size: number
  /** The flower's angle at rest, counter-clockwise in degrees. */
  angle: number
  top: number
  left: number
  direction: 1 | -1
}

export const CLUSTER: Gear[] = [
  { size: 32.742, angle: 29.03, top: 16.258, left: 7.384, direction: 1 },
  { size: 17.328, angle: 42.49, top: 5, left: 44, direction: -1 },
  { size: 22, angle: 55.22, top: 32, left: 47, direction: -1 },
]

/**
 * Seconds per revolution for the largest gear.
 *
 * Read against the lobes rather than the revolution: at eight-fold symmetry a
 * full turn is eight visually identical cycles, so 10s puts a lobe past a fixed
 * point every 1.25s. That is the number that decides how this feels. Much
 * faster and the badge reads as a loading spinner — which is the wrong promise,
 * since nothing here is pending — and much slower stops registering as motion.
 */
export const GEAR_PERIOD = 10


/**
 * The three help tiles under the onboarding card — Get Started's own, and only
 * its own. The ghost frames deliberately do not carry them: they are this page's
 * footer, not shell furniture, and repeating them under a placeholder would
 * claim they belong to every destination.
 *
 * `disc` is the circle's drawn diameter and `labelTop` its label's offset in the
 * 122px tile — both straight out of the file, and both larger/lower on Guide
 * than on the other two. That is the design, not a rounding error: the board
 * gives the first tile the emphasis.
 *
 * The exported SVG is bigger than the circle because the drop shadow is baked
 * into the artboard — 1.3529x on every side pair, which is where `TILE_BLEED`
 * comes from. Same ratio for all three, so one inset serves.
 */
export type Tile = { label: string; art: string; disc: number; labelTop: number }

export const TILES: Tile[] = [
  { label: 'Guide', art: tileGuide, disc: 56, labelTop: 93 },
  { label: 'Support', art: tileSupport, disc: 48, labelTop: 89 },
  { label: 'Community', art: tileCommunity, disc: 48, labelTop: 89 },
]

/** The shadow room around each tile's disc, as a fraction of the disc. */
export const TILE_BLEED = { top: -0.1176, right: -0.1765, bottom: -0.2353, left: -0.1765 }

/**
 * The height every ghost body fills, whatever archetype is drawn into it.
 *
 * Fixed so that moving between two placeholder destinations never resizes the
 * card — the frame holds still and only its contents morph, which is the whole
 * point of a placeholder set.
 *
 * 320 is not arbitrary. Left to themselves these bodies range from 128px for the
 * storage meter to 448px for the media stage, so no single natural height
 * exists; padding them all to the tallest would leave the meter sitting in 300px
 * of blank card. Instead each archetype nominates one element that absorbs the
 * slack — the chart, the thumbnails, the stage, the textarea, the rows — and 320
 * is the value at which every one of those lands in a believable proportion at
 * once. Notably it keeps the media stage near 475x185, wide enough to still read
 * as a video surface rather than as a stripe.
 */
export const GHOST_BODY = 320
