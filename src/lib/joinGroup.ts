/**
 * The Join Group screen's material — Figma node 309:977, "Slide 16:9 - 20".
 *
 * The design is a 1920×1428 slide, but everything in it lives in one 558px
 * column that sits dead centre. So the artboard's dimensions never appear here:
 * what is worth keeping is the column, the palette, and the copy. The rest is
 * atmosphere, and atmosphere scales.
 *
 * Values are the file's own hexes rather than house tokens on purpose — this is
 * the only dark surface in the playground, and every colour in `index.css` is
 * tuned for the light sheets. Mapping #111 onto `--color-panel` would make the
 * two drift the moment either one is touched.
 */

import iconVideoGenerate from '../assets/icons/join-group/video-generate-ai.svg'
import iconMovieReel from '../assets/icons/join-group/movie-reel.svg'
import iconColorPalette from '../assets/icons/join-group/color-palette.svg'
import iconPencilNib from '../assets/icons/join-group/pencil-nib.svg'
import iconLock from '../assets/icons/join-group/lock.svg'
import iconEarth from '../assets/icons/join-group/earth.svg'
import iconTickOn from '../assets/icons/join-group/tick-square-on.svg'
import iconTickOff from '../assets/icons/join-group/tick-square-off.svg'
import iconShieldAi from '../assets/icons/join-group/shield-ai.svg'
import iconPc from '../assets/icons/join-group/pc.svg'
import iconShare from '../assets/icons/join-group/share.svg'
import iconMessages from '../assets/icons/join-group/messages.svg'
import iconUser from '../assets/icons/join-group/user.svg'
import iconMultiChart from '../assets/icons/join-group/multi-chart.svg'
import iconMedal from '../assets/icons/join-group/medal.svg'
import iconDiscoverSearch from '../assets/icons/join-group/discover-search.svg'
import glow from '../assets/icons/join-group/glow-left.svg'
import grain from '../assets/images/join-group/grain.png'

export {
  iconVideoGenerate,
  iconMovieReel,
  iconColorPalette,
  iconPencilNib,
  iconLock,
  iconEarth,
  iconTickOn,
  iconTickOff,
  iconMedal,
  iconDiscoverSearch,
  glow,
  grain,
}

/* ---- Surfaces ---- */

/** The card the form sits on, and the colour its cut-outs are punched with. */
export const CARD = '#111111'
/** Every input, radio group and feature tile — one step up off the card. */
export const FIELD = '#1a1a1a'
/** The 1px edge on all of them, and the rule between the two access rows. */
export const EDGE = '#252525'
/** The "Restart onboarding" pill — a step *down* from the card, so it reads as
 *  chrome sitting on the page rather than as part of the form. */
export const PILL = '#121212'

/* ---- Ink ---- */

/** Section labels, body copy, and the name field's placeholder. */
export const LABEL = '#898989'
/** The trailing half of an access row — the explanation, not the choice. */
export const DIM = '#575757'

/* ---- Accents ---- */

/** The primary action, and the tick on the selected access row. */
export const ACTION = '#1d2aaf'

/**
 * The picker's palette — node 313:3178, twelve swatches in two rows of six.
 *
 * The hues are not the file's. All twelve of its ellipses are #ee2020, and that
 * is genuinely what is in the document rather than the exporter collapsing
 * them: Figma's own render of the node samples #ee2020 at all twelve centres.
 * The grid is built and the palette has not been assigned yet.
 *
 * So the geometry comes from the node and the colours are one even turn of the
 * wheel, ordered left to right across both rows so the panel reads as a
 * spectrum instead of a bag of colours. The file's red keeps the first slot.
 * Swap this array when the real palette lands — nothing else has to change.
 *
 * All twelve are bright enough to carry the movie-reel glyph, which is exported
 * with its dark plum baked in and does not re-tint.
 */
export const ACCENTS = [
  '#ee2020',
  '#ff6b00',
  '#ffb800',
  '#9ede00',
  '#22c55e',
  '#00c4a7',
  '#00c4ee',
  '#00a3ff',
  '#3b6bff',
  '#7b2ff7',
  '#ce00ee',
  '#ff4d8d',
] as const

/**
 * The colour before anyone touches it: the magenta the rest of the design is
 * drawn in, so an untouched screen still renders as the file does.
 *
 * A value rather than an index into `ACCENTS`, so reordering the palette above
 * cannot silently change what the page opens on.
 */
export const DEFAULT_ACCENT = '#ce00ee'

/**
 * The banner behind the avatar: the accent laid over the card at 8%.
 *
 * Derived rather than hard-coded, because the design's #201222 *is* that mix —
 * 0.08 × (206, 0, 238) + 0.92 × (17, 17, 17) = (32, 16, 35) against the file's
 * (32, 18, 34). Writing it as a mix means changing the accent changes the
 * banner with it, instead of leaving a magenta wash under a green avatar.
 */
export function bannerTint(accent: string) {
  return `color-mix(in srgb, ${accent} 8%, ${CARD})`
}

/* ---- Content ---- */

export type AccessId = 'private' | 'public'

export type AccessOption = {
  id: AccessId
  icon: string
  /** The choice itself — set in white. */
  title: string
  /** What it means, dimmed. Carries its own leading separator. */
  detail: string
}

/**
 * The two access modes, with the file's copy verbatim — including the fact that
 * the descriptions are swapped (private is described as findable by anyone,
 * public as invite-only). That is the designer's to fix, not this file's.
 */
export const ACCESS: AccessOption[] = [
  {
    id: 'private',
    icon: iconLock,
    title: 'Private access',
    detail: ' — Anyone can find and join',
  },
  {
    id: 'public',
    icon: iconEarth,
    title: 'Public access',
    detail: ' — Invite-only (recommended for creator circles)',
  },
]

export type Feature = {
  id: string
  icon: string
  label: string
  /** Draws the medal in the tile's top-right corner. */
  premium?: boolean
  /**
   * Box for the glyph inside its 24px cell. Most are a plain 24×24, but three
   * are not, and centring the odd ones by hand is the difference between the
   * row of icons sitting on one optical line and looking hand-placed:
   * `messages` is exported at its stroke bounds (17.81×19.56) and `multi-chart`
   * is a pixel taller than it is wide.
   */
  box?: { width: number; height: number }
}

export const FEATURES: Feature[] = [
  { id: 'login', icon: iconShieldAi, label: 'Login faster' },
  { id: 'devices', icon: iconPc, label: 'Multi-device access' },
  { id: 'sharing', icon: iconShare, label: 'Exclusive video sharing' },
  { id: 'feedback', icon: iconMessages, label: 'Feedback room', box: { width: 17.81, height: 19.56 } },
  { id: 'collab', icon: iconUser, label: 'Collab opportunities', premium: true },
  {
    id: 'monetization',
    icon: iconMultiChart,
    label: 'Monetization insights',
    premium: true,
    box: { width: 24, height: 25 },
  },
]

export const COPY = {
  title: 'Content creators inner circle',
  blurb:
    'Create a private space where video creators can share content, exchange feedback, and grow together—away from the noise of public platforms.',
  nameLabel: 'Community name/customization',
  namePlaceholder: 'examples: full-time creators, storyteller collective etc.',
  accessLabel: 'Community access type',
  featuresLabel: 'Community features',
  submit: 'Create community',
  submitted: 'Community created',
  restart: 'Restart onboarding',
} as const
