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

import { accentChain, type Palette } from 'glimm'

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
import iconRocket from '../assets/icons/join-group/icon-rocket.svg'
import glowLeft from '../assets/icons/join-group/glow-left.svg'
import glowRight from '../assets/icons/join-group/glow-right.svg'
import landingGlowLeft from '../assets/icons/join-group/landing-glow-left.svg'
import landingGlowRight from '../assets/icons/join-group/landing-glow-right.svg'
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
  iconRocket,
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

/* ---- Atmosphere ---- */

export type GlowLayer = {
  asset: string
  /** About the node's centre, which the bleed keeps concentric with the image. */
  transform?: string
}

/**
 * One screen's backdrop, as geometry rather than markup.
 *
 * Both screens are the same construction — two blurred blobs and a grain plate
 * over black — and differ only in where the blobs hang and how hard they are
 * blurred, so this is a table rather than two components.
 *
 * Every measurement is a fraction of the board's 1920px width, including the
 * vertical ones. That is deliberate: these are one full-bleed wash, and tying
 * their height to the viewport's would stretch them on a short window while the
 * shape they were drawn as stayed put.
 */
export type BackdropSpec = {
  /** Which edge the glow band hangs from. */
  anchor: 'top' | 'bottom'
  /** Distance from that edge to the band. Negative runs off it. */
  offset: number
  /** Inset from the left and right edges. Negative on both, so it overhangs. */
  x: number
  width: number
  height: number
  /**
   * How far the export overruns its node on every side. Figma bakes the
   * gaussian into the artboard, so the file is larger than the shape and the
   * image has to be offset back by exactly this much or the blur crops.
   */
  bleed: number
  imageWidth: number
  imageHeight: number
  left: GlowLayer
  right: GlowLayer
  /** A flat wash over the whole page, under the grain. */
  lift: string
  /**
   * The same two washes as a live field, which is what actually renders — the
   * `left`/`right` exports above are the fallback when WebGL is unavailable.
   *
   * `centerY` is a fraction of the viewport's height, not the board's width
   * like everything else here. The exports are placed to reproduce a fixed
   * composition and have to keep their proportions; the field is a drifting
   * wash with no fixed shape to preserve, so it wants the band to stay put
   * relative to the window instead.
   */
  field: {
    colorA: string
    colorB: string
    centerY: number
    intensity: number
  }
}

/**
 * The form's backdrop — node 309:977. Two washes across the top, blurred at
 * stdDeviation 200 and laid on at 15%, so they read as a stain in the corners
 * rather than as light.
 */
export const FORM_BACKDROP: BackdropSpec = {
  anchor: 'top',
  offset: -64 / 1920,
  x: -56 / 1920,
  width: 1065 / 1920,
  height: 510 / 1920,
  bleed: -400 / 1920,
  imageWidth: 1865 / 1920,
  imageHeight: 1310 / 1920,
  left: { asset: glowLeft },
  right: { asset: glowRight, transform: 'scaleX(-1)' },
  lift: 'rgba(0,0,0,0.01)',
  /* Band centred at (-64 + 255) / 1428 of the board's height. */
  field: { colorA: '#ff00bf', colorB: '#7b00ff', centerY: 0.13, intensity: 0.15 },
}

/**
 * The landing's backdrop — node 314:3401. The same two shapes flipped onto the
 * bottom edge, but blurred at 25 instead of 200 and laid on at 40% instead of
 * 15%. That is the whole difference between the two screens: here the glow is
 * the subject, so it is nearly ten times sharper and almost three times
 * stronger, and the exported file is 1165×610 against the form's 1865×1310
 * because a tighter blur needs far less room around the shape.
 */
export const LANDING_BACKDROP: BackdropSpec = {
  anchor: 'bottom',
  offset: 153 / 1920,
  x: -56 / 1920,
  width: 1065 / 1920,
  height: 510 / 1920,
  bleed: -50 / 1920,
  imageWidth: 1165 / 1920,
  imageHeight: 610 / 1920,
  left: { asset: landingGlowLeft, transform: 'scaleY(-1)' },
  right: { asset: landingGlowRight, transform: 'rotate(180deg)' },
  lift: 'rgba(255,255,255,0.04)',
  /* Band centred at (765 + 255) / 1428 of the board's height. */
  field: { colorA: '#ff00bf', colorB: '#7b00ff', centerY: 0.71, intensity: 0.4 },
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
 * The two access modes. The file attaches these descriptions the other way
 * round — private described as findable by anyone, public as invite-only — which
 * is a copy slip rather than a design decision, so they are paired correctly
 * here. Everything else, including the parenthetical, is the file's own wording.
 */
export const ACCESS: AccessOption[] = [
  {
    id: 'private',
    icon: iconLock,
    title: 'Private access',
    detail: ' — Invite-only (recommended for creator circles)',
  },
  {
    id: 'public',
    icon: iconEarth,
    title: 'Public access',
    detail: ' — Anyone can find and join',
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
  getStarted: 'Get Started',
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
  /* The third screen. Nothing here is in the file — it draws the landing and
     the form and stops at the button — so the voice is the form's: the title
     states what happened, the line under it says what to do next. */
  created: {
    title: 'Congratulations, your community is created',
    blurb: 'It is live and ready for members. Share the link and let your circle in.',
    linkLabel: 'Community link',
    copy: 'Copy link',
    copied: 'Link copied',
    shareLabel: 'Or share it straight to',
    fallbackName: 'your community',
  },
} as const

/* ---- The new community's address ---- */

/** Invented — the design names no host, and a link needs one to be a link. */
export const LINK_HOST = 'innercircle.club'

/**
 * The community's address, from whatever the creator typed.
 *
 * Slugged rather than echoed: the name field takes any string, and "Full-time
 * Creators!!" has to survive being shown as a URL. Empty names get a real slug
 * too — the form does not require one, so the screen after it cannot assume one.
 */
export function communitySlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .replace(/-+$/, '')

  return slug || 'new-community'
}

/** What the screen shows: host and path, no scheme. */
export function communityLink(name: string) {
  return `${LINK_HOST}/${communitySlug(name)}`
}

/** What gets copied and shared, which does need the scheme. */
export function communityUrl(name: string) {
  return `https://${communityLink(name)}`
}

export type ShareTarget = {
  /** Also picks the brand mark in `social-marks`. */
  id: 'x' | 'linkedin' | 'whatsapp'
  label: string
  href: (url: string, name: string) => string
}

/**
 * Where the three share buttons point.
 *
 * All three are real web intents, which is what chose them: Instagram is the
 * obvious fourth for a creator circle and has no share URL at all, so its button
 * could only ever be decoration. Swapping any of these is one entry here plus
 * its mark.
 */
export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: 'x',
    label: 'Share on X',
    href: (url, name) =>
      `https://x.com/intent/post?text=${encodeURIComponent(`I just started ${name} — come join us.`)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    label: 'Share on LinkedIn',
    href: url => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    label: 'Share on WhatsApp',
    href: (url, name) => `https://wa.me/?text=${encodeURIComponent(`I just started ${name} — come join us. ${url}`)}`,
  },
]

/**
 * The palette the landing-to-form sweep is drawn in.
 *
 * Not picked — derived. The band takes the landing's own glow field, the two
 * colours already washing the bottom of that screen, with the untouched accent
 * threaded between them. So the light that crosses the page during the
 * transition is the light that was already behind the button, and recolouring
 * the backdrop moves the sweep with it rather than leaving it stranded on a
 * hex nobody remembers setting.
 *
 * glimm wants a cosine palette rather than hexes. `accentChain` fits one
 * through the three anchors in OKLCH, which keeps the middle of the sweep a
 * bright magenta instead of dipping through the muddy grey an sRGB
 * interpolation would put between #ff00bf and #7b00ff.
 */
export const SWEEP_PALETTE: Palette = accentChain([
  LANDING_BACKDROP.field.colorA,
  DEFAULT_ACCENT,
  LANDING_BACKDROP.field.colorB,
])
