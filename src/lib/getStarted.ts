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

export type NavItem = {
  label: string
  icon: Glyph
  /** The red bead the Updates row carries. */
  badge?: boolean
}

/** The three stacks above the fold, separated by hairlines. */
export const NAV_SECTIONS: NavItem[][] = [
  [
    { label: 'Get Started', icon: { src: iconRocket } },
    { label: 'Overview', icon: { src: iconWebPage } },
    { label: 'Explorer', icon: { src: iconGridSearch } },
    { label: 'Playground', icon: { src: iconMultitasking } },
  ],
  [
    { label: 'Events', icon: { src: iconVideo, inset: '19.04% 5.84% 19.08% 5.83%' } },
    { label: 'Chat Rooms', icon: { src: iconChat, inset: '13.15% 11.46% 13.14% 11.45%' } },
    { label: 'Doc Vault', icon: { src: iconDocument } },
    { label: 'Media Player', icon: { src: iconDisplay4k } },
    { label: 'Cloud Storage', icon: { src: iconCloudWifi } },
  ],
  [
    { label: 'Appearance', icon: { src: iconColorPalette } },
    { label: 'Reports', icon: { src: iconUpGraph } },
    { label: 'Referrals', icon: { src: iconGift } },
  ],
]

/** The stack pinned to the bottom of the rail. */
export const NAV_FOOTER: NavItem[] = [
  { label: 'Settings', icon: { src: iconPreferences } },
  { label: 'Updates', icon: { src: iconUpdateSquare }, badge: true },
  { label: 'Feedback', icon: { src: iconThumbLike } },
]

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
 * The three help tiles.
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
