import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import {
  BADGE_MARGIN,
  BADGE_SIZE,
  BADGE_TARGET,
  FOCUS_H,
  FOCUS_W,
  GHOST,
  GHOST_BLUR,
  GHOST_FOCUS_Y,
  GHOST_REST_Y,
  GHOST_SIZE,
  GHOST_TEX_SCALE,
  GHOST_TEX_SPAN,
  GHOST_TRACKING,
  HELIX_BOIL,
  HELIX_CAMERA_DISTANCE,
  HELIX_CARD_ASPECT,
  HELIX_FOG_FAR,
  HELIX_FOG_NEAR,
  HELIX_FOCAL,
  HELIX_FRONT_PHASE,
  HELIX_LIFT,
  HELIX_LOCAL_PERSPECTIVE,
  HELIX_OMEGA,
  HELIX_RADIUS,
  HELIX_RISE,
  HELIX_SHADOW_ALPHA,
  HELIX_SHADOW_BLUR,
  HELIX_SHADOW_DEPTH,
  HELIX_SHADOW_EXPAND,
  HELIX_SHADOW_OFFSET,
  HELIX_TILT_X,
  HELIX_TILT_Y,
  HELIX_TWIST,
  HELIX_ZETA,
  PANEL_BADGE_BACK,
  PLATE,
  REST_SCALE,
  TILE_RADIUS,
} from '../lib/writersGarden'
import { springStep, type SpringState } from '../lib/spring'
import { boilOffset, getTier, smoothstep } from '../lib/ponpon'

/**
 * The badges wound up a helix, for the vertical layout.
 *
 * Twelve cards are twelve bases on one strand of B-DNA, at the molecule's own
 * 34.3° of twist each. The geometry and the reasoning behind which of DNA's
 * numbers are used literally live in `lib/writersGarden.ts` — this file is the
 * renderer.
 *
 * The backbones and the base-pair rungs used to be drawn here too, and are not
 * any more: the path is left to be inferred from where the cards are, which is
 * the reading with nothing between the viewer and the twelve things that
 * matter. It also costs the second strand, since the cards only ever rode the
 * first — so this is now a single helix rather than a double one, and the 120°
 * groove offset that made it read as DNA went with the geometry it positioned.
 *
 * What rides the helix is the *whole card*, not a badge on its own: the #fafafa
 * plate at 498×517 with 28px corners, the ghost name rising behind it, the
 * shimmer sweep, the pointer glow, the hover tilt and the focus scale. In the
 * horizontal rail every one of those is CSS on a DOM tile. None of them can be
 * here, because the tile is a textured quad inside a 3D scene — a DOM element
 * cannot be at 34° of yaw eleven units down a helix. So each has been rebuilt
 * as shader maths, and the note above each one says what it is reproducing.
 *
 * Three things drive every frame, and they all come from one scalar:
 *
 *   the phase       `HELIX_FRONT_PHASE − index · HELIX_TWIST`
 *   the camera      `(0, index · HELIX_RISE, HELIX_CAMERA_DISTANCE)`
 *   the focus       `smoothstep(1, 0, |i − index|)`, per card
 *
 * That scalar is the *continuous badge index*, and it is not the scroll
 * position — it trails the scroll on a damped harmonic oscillator solved
 * analytically in `lib/spring.ts`. Deriving rotation, rise and focus from the
 * same number is what keeps them from ever disagreeing.
 *
 * Transparency is painter's algorithm rather than a depth buffer. The plate is
 * opaque, but its rounded corners are not, and depth-testing a soft edge needs
 * either back-to-front order or a cutout that would chew the corners off. So the
 * twelve cards are sorted by view distance each frame — twelve items, an
 * insertion sort, nothing. With the strands gone that ordering is now the whole
 * of the depth story, and it is exact: the cards are well separated along the
 * helix and never interpenetrate, which is the one case per-quad sorting cannot
 * resolve.
 */

/** Fewer texels on weak hardware. */
const textureSize = () => (getTier() >= 2 ? 512 : 256)

/** The badge art's rectangle inside the card, in card uv — the design's own
 *  `BADGE_IMG` placement, normalised. */
const BADGE_IMG = (BADGE_SIZE + BADGE_MARGIN * 2) * (BADGE_TARGET / BADGE_SIZE)
const BADGE_IMG_X = (FOCUS_W - BADGE_TARGET) / 2 - BADGE_MARGIN * (BADGE_TARGET / BADGE_SIZE)
const BADGE_IMG_Y = (FOCUS_H - BADGE_TARGET) / 2 - BADGE_MARGIN * (BADGE_TARGET / BADGE_SIZE)
const BADGE_RECT = [
  BADGE_IMG_X / FOCUS_W,
  BADGE_IMG_Y / FOCUS_H,
  BADGE_IMG / FOCUS_W,
  BADGE_IMG / FOCUS_H,
] as const

/** `skewX(-20deg)` from the shimmer keyframes, converted from a CSS transform
 *  into the shear the shader has to apply to the gradient's own axis: the
 *  tangent, times the card's height-to-width ratio, because the CSS skew works
 *  in pixels and the shader works in normalised card space. */
const SHIMMER_SKEW = Math.tan((20 * Math.PI) / 180) * (FOCUS_H / FOCUS_W)
/** The CSS animation's 1.5s period and 0.25s per-card stagger. */
const SHIMMER_PERIOD = 1.5
const SHIMMER_STAGGER = 0.25

const CARD_VERTEX = `
attribute vec2 aCorner;

uniform float uPhase;
uniform float uIndex;
uniform float uScale;
uniform vec3  uTilt;
uniform vec2  uBoil;
uniform float uShadow;
uniform vec3  uCamera;
uniform mat4  uProj;

varying vec2  vUv;
varying vec3  vNormal;
varying vec3  vView;
varying float vFog;

void main() {
  vUv = aCorner * 0.5 + 0.5;

  // Where this card sits on the helix. Both terms come from the same index —
  // the angle it has been turned through, and how far it has climbed.
  float phase = uPhase + uIndex * ${HELIX_TWIST.toFixed(8)};
  vec3 centre = vec3(
    ${HELIX_RADIUS.toFixed(4)} * cos(phase),
    uIndex * ${HELIX_RISE.toFixed(6)} + uTilt.z,
    ${HELIX_RADIUS.toFixed(4)} * sin(phase)
  );

  /* The card faces out from the axis, so its normal *is* its radial direction —
     which is why it looks straight down the lens at the front of the helix and
     shows its reverse at the back, with no special-casing. Local +X is
     up × normal, giving a right-handed frame; that keeps the winding
     counter-clockwise face-on, so gl_FrontFacing still picks the front. */
  vec3 normal = vec3(cos(phase), 0.0, sin(phase));
  vec3 right = vec3(sin(phase), 0.0, -cos(phase));
  vec3 up = vec3(0.0, 1.0, 0.0);

  /* The card, in its own plane, at the focus scale — the rail's REST_SCALE..1,
     about its own centre. Perspective is already making the near cards bigger;
     this is the *other* thing the rail does, and it is a different statement:
     depth says how far away a card is, focus says which one is being read.

     The shadow pass draws the same card expanded, so its blur has somewhere to
     fall off inside the quad, offset down its own face and pushed onto a plane
     behind it. That last part is what makes it a shadow rather than a sticker:
     it yaws with the card, so the offset foreshortens along with everything
     else. */
  float grow = uShadow > 0.0 ? ${HELIX_SHADOW_EXPAND.toFixed(4)} : 1.0;
  vec3 local = vec3(aCorner.x * ${HELIX_CARD_ASPECT.toFixed(6)}, aCorner.y, 0.0) * uScale * grow;
  if (uShadow > 0.0) {
    local.y -= ${HELIX_SHADOW_OFFSET.toFixed(6)} * uShadow;
    local.z -= ${HELIX_SHADOW_DEPTH.toFixed(4)};
  }
  vec3 n = vec3(0.0, 0.0, 1.0);

  /* The hover tilt, about the card's own axes and in the rail's order — GSAP
     writes rotationY then rotationX onto the tile, and a rotation pair does not
     commute, so the order is part of the look rather than an implementation
     detail. The rail's transformPerspective is matched just below, because the
     camera on its own does not supply enough of it. */
  float cy = cos(uTilt.y);
  float sy = sin(uTilt.y);
  local = vec3(local.x * cy + local.z * sy, local.y, -local.x * sy + local.z * cy);
  n = vec3(n.x * cy + n.z * sy, n.y, -n.x * sy + n.z * cy);

  float cx = cos(uTilt.x);
  float sx = sin(uTilt.x);
  local = vec3(local.x, local.y * cx - local.z * sx, local.y * sx + local.z * cx);
  n = vec3(n.x, n.y * cx - n.z * sx, n.y * sx + n.z * cx);

  /* The card's own perspective, on top of the camera's — the rail's
     transformPerspective: 900, which is an eye far closer than this camera and
     is why a tilt there keystones twice as hard as one here. See
     HELIX_LOCAL_PERSPECTIVE for the composition. Exactly 1 at rest, because a
     flat quad has z = 0 at every vertex. */
  float persp = ${HELIX_LOCAL_PERSPECTIVE.toFixed(5)}
    / max(${HELIX_LOCAL_PERSPECTIVE.toFixed(5)} - local.z, 0.001);
  local.xy *= persp;

  /* The boil. Applied in the card's own plane rather than in screen space, so
     it wobbles with the surface instead of sliding across it — seeded by index
     so no two cards shake together. */
  local.xy += uBoil;

  vec3 world = centre + right * local.x + up * local.y + normal * local.z;
  vec3 view = world - uCamera;

  vNormal = right * n.x + up * n.y + normal * n.z;
  vView = -view;
  vFog = smoothstep(${HELIX_FOG_NEAR.toFixed(4)}, ${HELIX_FOG_FAR.toFixed(4)}, length(view));

  gl_Position = uProj * vec4(view, 1.0);
}
`

const CARD_FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uBadge;
uniform sampler2D uGhost;
uniform vec3  uLight;
uniform vec3  uBack;
uniform vec3  uPlate;
uniform vec3  uFogColor;
uniform float uFocus;
uniform float uShimmer;
uniform float uShadow;
/** xy: pointer in card uv. z: strength. w: the hover edge and shadow weight. */
uniform vec4  uGlow;

varying vec2  vUv;
varying vec3  vNormal;
varying vec3  vView;
varying float vFog;

const float AMBIENT = 0.80;
const float DIFFUSE = 0.28;
const float SHININESS = 42.0;
const float SPECULAR = 0.55;
const float RIM = 0.45;
const float RIM_FALLOFF = 4.0;

void main() {
  bool front = gl_FrontFacing;

  /* Card space, top-down, so every number below can be the design's own. The
     texture arrives from a 2D canvas, which is top-down where GL is not, and
     the back of the card is the front mirrored. */
  vec2 uv = vec2(front ? vUv.x : 1.0 - vUv.x, 1.0 - vUv.y);

  /* The plate — a rounded rectangle, evaluated rather than textured. This is
     the one part of the card that never needed a raster: it is 28px corners on
     a flat fill, and an SDF gives that at any size with no texels to minify.
     Distances are in the design's own pixels. */
  /* On the shadow pass the quad was grown by HELIX_SHADOW_EXPAND, so the uv
     span covers more than the card — undoing that here keeps the rounded rect
     the card's own size with clear margin around it for the blur. */
  float grow = uShadow > 0.0 ? ${HELIX_SHADOW_EXPAND.toFixed(4)} : 1.0;
  vec2 p = (uv - 0.5) * vec2(${FOCUS_W.toFixed(1)}, ${FOCUS_H.toFixed(1)}) * grow;
  vec2 q = abs(p) - vec2(${(FOCUS_W / 2).toFixed(1)}, ${(FOCUS_H / 2).toFixed(1)}) + ${TILE_RADIUS.toFixed(1)};
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - ${TILE_RADIUS.toFixed(1)};

  if (uShadow > 0.0) {
    /* A blurred silhouette, and nothing else — no plate, no art, no lighting.
       The ramp stands in for the gaussian a CSS box-shadow would run: over a
       spread this wide the difference between the two is not something anyone
       can point at, and it costs one smoothstep instead of a blur pass. */
    float s = 1.0 - smoothstep(-${(HELIX_SHADOW_BLUR * (FOCUS_H / 2)).toFixed(1)}, ${(HELIX_SHADOW_BLUR * (FOCUS_H / 2)).toFixed(1)}, d);
    float a = s * ${HELIX_SHADOW_ALPHA.toFixed(3)} * uShadow * (1.0 - vFog);
    // Premultiplied, and black, so the colour is simply zero.
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);
    return;
  }

  // 2 design-pixels of feather. The card is drawn at roughly 0.6 of design size
  // at the front of the helix, so this lands near one screen pixel there.
  float plate = 1.0 - smoothstep(-1.0, 1.0, d);
  if (plate <= 0.002) discard;

  vec3 col = uPlate;

  if (front) {
    /* The pointer glow — a lit spot falling away to a darkened rim.
       On a #fafafa plate a white highlight has almost nowhere to go, so most of
       the read comes from the far edge dropping away rather than the near one
       lifting. The radii are the CSS gradient's 55%, and the stops are its 0.85
       white at the centre, nothing at 55% of that, and 0.08 black at the ending
       shape.

       It goes *under* the ghost and the badge, which is not an aesthetic choice
       but what the CSS does: .card-glow::before is a pseudo-element at
       z-index 0 and the plate's children are positioned with z-index auto, so
       the paint order puts it beneath both. The glow lights the plate, not the
       artwork on it. */
    vec2 g = (uv - uGlow.xy) / 0.55;
    float gd = length(g);
    vec3 glowCol = gd < 0.55 ? vec3(1.0) : vec3(0.0);
    float glowA = gd < 0.55
      ? mix(0.85, 0.0, gd / 0.55)
      : mix(0.0, 0.08, clamp((gd - 0.55) / 0.45, 0.0, 1.0));
    col = mix(col, glowCol, glowA * uGlow.z);

    /* The hover edge — the card-glow inset hairline, one design pixel wide and
       present only while the pointer is on the card. */
    col = mix(col, col * 0.91, uGlow.w * smoothstep(-1.0, 0.0, d));

    /* The ghost name, behind the badge.
       The word does not fade in, it rises: GHOST_REST_Y below its focused
       position when the card is cold. Baked at one position, so what moves is
       the window this samples through — which is why the texture spans the card
       plus the whole travel. Outside that band it is transparent, and the card
       shows plate, which is the word being genuinely out of frame rather than
       merely invisible. */
    float row = uv.y * ${FOCUS_H.toFixed(1)};
    float drop = (1.0 - uFocus) * ${GHOST_REST_Y.toFixed(1)};
    vec2 ghostUv = vec2(uv.x, (row - drop + ${GHOST_REST_Y.toFixed(1)}) / ${GHOST_TEX_SPAN.toFixed(1)});
    vec4 ghost = texture2D(uGhost, ghostUv);
    // Premultiplied, so this is a plain over-composite onto the plate.
    col = col * (1.0 - ghost.a) + ghost.rgb;

    /* The badge, placed into its rectangle of the card exactly as the design
       places it. Masked rather than clamped: CLAMP_TO_EDGE would smear the
       border texels across the rest of the plate. */
    vec2 bUv = (uv - vec2(${BADGE_RECT[0].toFixed(6)}, ${BADGE_RECT[1].toFixed(6)}))
             / vec2(${BADGE_RECT[2].toFixed(6)}, ${BADGE_RECT[3].toFixed(6)});
    vec2 inside = step(vec2(0.0), bUv) * step(bUv, vec2(1.0));
    vec4 badge = texture2D(uBadge, bUv) * inside.x * inside.y;
    col = col * (1.0 - badge.a) + badge.rgb;

    /* The shimmer — the CSS gradient, sheared and swept, and last of all
       because .badge-shimmer::after carries a z-index of 1 and so paints over
       the badge rather than under it.
       A band the width of the card travelling from -100% to 200%, peaking at
       0.35 white in its middle and falling to nothing a quarter of the way to
       either edge. The shear is skewX(-20deg) resolved into card space. Mixed
       toward white rather than added: the CSS is a translucent white fill
       composited over, and on the badge's saturated pink the two differ. */
    float s = uv.x - uShimmer + ${SHIMMER_SKEW.toFixed(6)} * (uv.y - 0.5);
    col = mix(col, vec3(1.0), 0.35 * max(0.0, 1.0 - abs(s - 0.5) / 0.25));
  } else {
    /* The reverse: the plate, with the badge struck into it in plain metal.
       Thresholded because the export's alpha carries the design's drop shadow,
       which read from behind would silhouette as a halo around a solid disc. */
    vec2 bUv = (uv - vec2(${BADGE_RECT[0].toFixed(6)}, ${BADGE_RECT[1].toFixed(6)}))
             / vec2(${BADGE_RECT[2].toFixed(6)}, ${BADGE_RECT[3].toFixed(6)});
    vec2 inside = step(vec2(0.0), bUv) * step(bUv, vec2(1.0));
    float emblem = smoothstep(0.55, 0.8, texture2D(uBadge, bUv).a) * inside.x * inside.y;
    col = mix(col, uBack, emblem);
  }

  /* The lighting the rail has no need of, because a DOM tile never turns away
     from you. Held gentle: face-on it comes to 1.0015, so a card at the front
     of the helix is the texture essentially untouched. */
  vec3 N = normalize(front ? vNormal : -vNormal);
  vec3 L = normalize(uLight);
  vec3 V = normalize(vView);
  vec3 H = normalize(L + V);

  col *= AMBIENT + DIFFUSE * max(dot(N, L), 0.0);
  col += pow(max(dot(N, H), 0.0), SHININESS) * SPECULAR;
  col += pow(1.0 - abs(dot(N, V)), RIM_FALLOFF) * RIM;

  // Depth by loss of contrast rather than by darkening — the page is white.
  col = mix(col, uFogColor, vFog);

  gl_FragColor = vec4(col * plate, plate);
}
`

/* ---- Plumbing ---- */

function compile(gl: WebGLRenderingContext, type: number, source: string, tag: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(`[BadgeHelix] ${tag} failed to compile:`, gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function link(gl: WebGLRenderingContext, vs: string, fs: string, tag: string) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vs, `${tag} vertex`)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fs, `${tag} fragment`)
  if (!vertex || !fragment) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(`[BadgeHelix] ${tag} failed to link:`, gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/**
 * A standard perspective projection, column-major for `uniformMatrix4fv`.
 *
 * Takes the focal length rather than a field of view, because nothing here ever
 * chooses an angle: the focal length is solved from the size the focused card
 * has to come out at — see `HELIX_FOCAL` — and converting it to an angle only
 * to take the tangent again would be a round trip through two trig calls for
 * the same number.
 *
 * Written out rather than pulled from a matrix library because it is the only
 * matrix in the file — the view transform is a pure translation (the camera
 * never rotates; the *helix* turns) and so is applied as a vector subtraction
 * in the vertex shaders instead.
 */
function perspective(out: Float32Array, f: number, aspect: number, near: number, far: number) {
  out.fill(0)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) / (near - far)
  out[11] = -1
  out[14] = (2 * far * near) / (near - far)
  return out
}

/** `#rrggbb` to three 0–1 floats. */
function toRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function configure(gl: WebGLRenderingContext, mips: boolean, anisotropy: number) {
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (mips && anisotropy > 1) {
    const ext = gl.getExtension('EXT_texture_filter_anisotropic')
    if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy)
  }
}

async function uploadBadge(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  src: string,
  size: number,
  anisotropy: number,
) {
  const image = new Image()
  image.decoding = 'async'
  image.width = size
  image.height = size
  image.src = src
  await image.decode()

  const scratch = document.createElement('canvas')
  scratch.width = size
  scratch.height = size
  const ctx = scratch.getContext('2d')
  if (!ctx) return
  ctx.drawImage(image, 0, 0, size, size)

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch)
  gl.generateMipmap(gl.TEXTURE_2D)
  configure(gl, true, anisotropy)
}

/**
 * The ghost name, baked.
 *
 * The rail sets this as a 200px `<p>` behind the badge, blurred, clipped by the
 * tile. Here it is a texture, and the two things that make that work are both
 * about the blur: it is rendered at half scale, because a 10px gaussian on a
 * 200px glyph destroys more than halving the raster does; and it is NPOT with
 * no mip chain, which is normally a mistake and is fine for an image that has
 * already had every high frequency taken out of it.
 *
 * The canvas is `GHOST_REST_Y` taller than the card and the word sits that far
 * down it, so the shader has an empty band to slide the sampling window into
 * when a card is cold. That empty band is the word being out of frame.
 */
function bakeGhost(name: string): HTMLCanvasElement | null {
  const scale = GHOST_TEX_SCALE
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(FOCUS_W * scale)
  canvas.height = Math.round(GHOST_TEX_SPAN * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.filter = `blur(${GHOST_BLUR * scale}px)`
  ctx.fillStyle = GHOST
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  // `letterSpacing` is a recent addition; where it is missing the word is a
  // few percent wider, which on a blurred watermark is not a thing anyone can
  // see. Assigning it is harmless either way.
  ctx.letterSpacing = `${GHOST_TRACKING * scale}px`
  ctx.font = `600 ${GHOST_SIZE * scale}px 'TWK Lausanne', 'Inter Display', 'Inter Variable', system-ui, sans-serif`

  // The design's own offset: slung below the card's centre, not on it, which is
  // what lets the badge sit on the word rather than in front of it. Plus the
  // travel, because texture row 0 is GHOST_REST_Y above the card's top edge.
  const top = (FOCUS_H / 2 + GHOST_FOCUS_Y + GHOST_REST_Y) * scale
  ctx.fillText(name, canvas.width / 2, top)
  return canvas
}

export type BadgeHelixProps = {
  badges: { name: string; art: string }[]
  /**
   * The continuous badge index the scroller is currently at — written every
   * scroll event by the parent, read every frame here. A ref rather than a prop
   * because this changes at pointer rate and must not re-render React.
   */
  targetRef: { current: number }
  /** Called when the badge nearest the front changes. */
  onFront?: (index: number) => void
  /**
   * Called with the card the pointer is over, or -1 when it is over none.
   *
   * The same pick that drives the tilt and the glow, surfaced so the layer
   * above can answer "is the pointer on a card" — which it cannot work out for
   * itself: its hit targets are full-width bands, and the card a given band is
   * under changes as the helix winds. Fires only on change, and only for a
   * pointer that can hover.
   */
  onHover?: (index: number) => void
  /** The page colour the far side of the helix fades into. */
  fog: string
  /** Drawn instead when WebGL is unavailable or a shader will not build. */
  fallback?: ReactNode
  className?: string
}

export function BadgeHelix({
  badges,
  targetRef,
  onFront,
  onHover,
  fog,
  fallback = null,
  className,
}: BadgeHelixProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [supported, setSupported] = useState(true)
  const onFrontRef = useRef(onFront)
  onFrontRef.current = onFront
  const onHoverRef = useRef(onHover)
  onHoverRef.current = onHover
  const badgesRef = useRef(badges)
  badgesRef.current = badges

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // Created imperatively for the same reason as SpinningBadge: cleanup loses
    // the context, and a lost context is sticky on the element that had it, so
    // StrictMode's double-invoke would rebuild onto a dead one.
    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    host.append(canvas)

    const fail = () => {
      canvas.remove()
      setSupported(false)
    }

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: 'default',
    })
    if (!gl) {
      fail()
      return
    }

    const cardProgram = link(gl, CARD_VERTEX, CARD_FRAGMENT, 'card')
    if (!cardProgram) {
      fail()
      return
    }

    const count = badgesRef.current.length

    /* ---- Buffers ---- */

    const quadBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    /* ---- Textures ---- */

    const size = textureSize()
    const ext = gl.getExtension('EXT_texture_filter_anisotropic')
    const anisotropy = ext
      ? Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT))
      : 1

    /** Bound wherever a real texture has not arrived yet, so a card is never
     *  drawn sampling whatever the driver left in an uninitialised unit. */
    const blank = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, blank)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]),
    )
    configure(gl, false, 1)

    const badgeTextures: (WebGLTexture | null)[] = []
    const ghostTextures: (WebGLTexture | null)[] = []
    const badgeReady: boolean[] = []
    const ghostReady: boolean[] = []
    let disposed = false

    for (let i = 0; i < count; i++) {
      const badge = gl.createTexture()
      badgeTextures.push(badge)
      badgeReady.push(false)
      ghostTextures.push(gl.createTexture())
      ghostReady.push(false)
      if (!badge) continue
      // Progressive: each card appears as it decodes rather than the helix
      // waiting on the slowest of twelve.
      void uploadBadge(gl, badge, badgesRef.current[i].art, size, anisotropy).then(() => {
        if (!disposed) badgeReady[i] = true
      })
    }

    /* The ghosts wait on the webfont. Baking before it loads paints the whole
       set in the fallback face — and since these are textures rather than live
       text, nothing would ever repaint them once it arrived. */
    void document.fonts.ready.then(() => {
      if (disposed) return
      for (let i = 0; i < count; i++) {
        const texture = ghostTextures[i]
        const baked = bakeGhost(badgesRef.current[i].name)
        if (!texture || !baked) continue
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, baked)
        // No mips: the canvas is NPOT, and a texture this blurred has no high
        // frequencies left for a mip chain to protect.
        configure(gl, false, 1)
        ghostReady[i] = true
      }
    })

    /* ---- Uniforms ---- */

    const cardUniforms = {
      phase: gl.getUniformLocation(cardProgram, 'uPhase'),
      index: gl.getUniformLocation(cardProgram, 'uIndex'),
      scale: gl.getUniformLocation(cardProgram, 'uScale'),
      tilt: gl.getUniformLocation(cardProgram, 'uTilt'),
      boil: gl.getUniformLocation(cardProgram, 'uBoil'),
      shadow: gl.getUniformLocation(cardProgram, 'uShadow'),
      camera: gl.getUniformLocation(cardProgram, 'uCamera'),
      proj: gl.getUniformLocation(cardProgram, 'uProj'),
      focus: gl.getUniformLocation(cardProgram, 'uFocus'),
      shimmer: gl.getUniformLocation(cardProgram, 'uShimmer'),
      glow: gl.getUniformLocation(cardProgram, 'uGlow'),
    }
    const fogRgb = toRgb(fog)

    gl.useProgram(cardProgram)
    gl.uniform1i(gl.getUniformLocation(cardProgram, 'uBadge'), 0)
    gl.uniform1i(gl.getUniformLocation(cardProgram, 'uGhost'), 1)
    gl.uniform3f(gl.getUniformLocation(cardProgram, 'uLight'), -0.35, 0.6, 0.72)
    gl.uniform3fv(gl.getUniformLocation(cardProgram, 'uBack'), toRgb(PANEL_BADGE_BACK))
    gl.uniform3fv(gl.getUniformLocation(cardProgram, 'uPlate'), toRgb(PLATE))
    gl.uniform3fv(gl.getUniformLocation(cardProgram, 'uFogColor'), fogRgb)

    const aCorner = gl.getAttribLocation(cardProgram, 'aCorner')
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.disable(gl.CULL_FACE)

    /* ---- Hover ----
     *
     * The rail gets this from `pointerenter` on twelve DOM tiles. There are no
     * tiles here, so the card under the cursor has to be found by casting a ray
     * through the projection and intersecting the twelve quads — which is the
     * honest version of what the browser is doing for the rail anyway.
     *
     * Smoothed by GSAP on the same curve and duration the rail uses, so the two
     * layouts feel like the same object under the cursor. `quickTo` rather than
     * a tween per move: one reusable tween per property, fed a number on each
     * flush, instead of a timeline allocated sixty times a second.
     */
    const hover = { index: -1, tiltX: 0, tiltY: 0, lift: 0, glowX: 0.5, glowY: 0.5, glow: 0 }
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const ease = 'power3.out'
    const toTiltX = gsap.quickTo(hover, 'tiltX', { duration: 0.5, ease })
    const toTiltY = gsap.quickTo(hover, 'tiltY', { duration: 0.5, ease })
    const toLift = gsap.quickTo(hover, 'lift', { duration: 0.45, ease })
    const toGlowX = gsap.quickTo(hover, 'glowX', { duration: 0.5, ease })
    const toGlowY = gsap.quickTo(hover, 'glowY', { duration: 0.5, ease })

    let pointerX = -1
    let pointerY = -1
    let pointerInside = false
    /** The previous frame's pick, which is not the same thing as `hover.index`
     *  — see the note at the call site. */
    let pickedLast = -1
    /** Where on the picked card the ray landed, in its own top-down uv. */
    let hoverU = 0.5
    let hoverV = 0.5

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      const rect = canvas.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerY = 1 - ((event.clientY - rect.top) / rect.height) * 2
      pointerInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    }
    const onPointerLeave = () => {
      pointerInside = false
    }

    /* On the window, not the canvas: the canvas is `pointer-events: none` with
       the scroll layer over it, so it never sees a pointer event of its own. */
    if (fine.matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
    }

    /* ---- State ---- */

    const proj = new Float32Array(16)
    /** The damped index. `x` is where the helix actually is; the scroller's
     *  value is only ever the target it is being pulled toward. */
    const helix: SpringState = { x: targetRef.current, v: 0 }
    let front = -1
    let last = performance.now()
    const order = Array.from({ length: count }, (_, i) => i)
    const depth = new Float32Array(count)
    const scales = new Float32Array(count)
    const focuses = new Float32Array(count)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let aspect = 1
    /** Solved on every resize, not chosen — see `HELIX_FOCAL`. */
    let focal = 1

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (w === width && h === height) return
      width = w
      height = h
      aspect = w / h
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      /* From the CSS height, not the backing-store one: `FOCUS_H` is a CSS
         pixel measurement, and the card has to come out at 517 of those on a
         retina display exactly as it does anywhere else. */
      focal = HELIX_FOCAL(canvas.clientHeight)
      perspective(proj, focal, aspect, 0.1, 100)
      gl.useProgram(cardProgram)
      gl.uniformMatrix4fv(cardUniforms.proj, false, proj)
    }

    /**
     * Which card the cursor is over, and where on it.
     *
     * A ray from the camera through the pointer, against each card's plane.
     * Cards facing away are skipped — the glow and the tilt belong to the front
     * of a card, and the back of one is not a thing you can point at. The rest
     * pose is what gets tested, not the tilted one: hit-testing the card's own
     * response to being hovered is a feedback loop, and it makes the edges of a
     * tilted card chatter in and out of hover.
     */
    const pick = (phase: number, camY: number) => {
      if (!pointerInside) return -1
      // The ray has to be built with the lens the frame was actually drawn
      // with, and that lens is resolved per resize rather than fixed.
      const dx = (pointerX / focal) * aspect
      const dy = pointerY / focal
      const dz = -1
      const len = Math.hypot(dx, dy, dz)
      const rx = dx / len
      const ry = dy / len
      const rz = dz / len

      let best = -1
      let bestT = Infinity
      for (let i = 0; i < count; i++) {
        const p = phase + i * HELIX_TWIST
        const nx = Math.cos(p)
        const nz = Math.sin(p)
        const denom = rx * nx + rz * nz
        // Facing away, or edge-on.
        if (denom > -1e-4) continue

        const cx = HELIX_RADIUS * nx
        const cy = i * HELIX_RISE - camY
        const cz = HELIX_RADIUS * nz - HELIX_CAMERA_DISTANCE
        const t = (cx * nx + cz * nz) / denom
        if (t <= 0 || t >= bestT) continue

        // Card-local coordinates of the hit.
        const hx = rx * t - cx
        const hy = ry * t - cy
        const hz = rz * t - cz
        const s = scales[i]
        const lx = hx * nz - hz * nx
        if (Math.abs(lx) > HELIX_CARD_ASPECT * s) continue
        if (Math.abs(hy) > s) continue

        bestT = t
        best = i
        hoverU = lx / (HELIX_CARD_ASPECT * s) * 0.5 + 0.5
        hoverV = 0.5 - (hy / s) * 0.5
      }
      return best
    }

    const render = () => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      resize()

      /* The physics. No `dt` clamp and no substepping — the solver is exact at
         any step and unconditionally stable, which is the entire reason it is
         an analytic solution rather than an integrator. A tab returning from the
         background hands back a delta of several seconds, and the right answer
         for that is simply "the spring has finished". */
      springStep(helix, targetRef.current, HELIX_OMEGA, HELIX_ZETA, dt)

      const index = helix.x
      const phase = HELIX_FRONT_PHASE - index * HELIX_TWIST
      const camY = index * HELIX_RISE
      const seconds = now / 1000

      /* Focus and its scale, the rail's own curve: one full pitch of falloff, so
         at rest exactly one card is at 1 and its neighbours are at 0. */
      for (let i = 0; i < count; i++) {
        const focus = smoothstep(1, 0, Math.abs(i - index))
        focuses[i] = focus
        scales[i] = REST_SCALE + (1 - REST_SCALE) * focus
      }

      /* Sort back to front. Distance is to the card's centre, which is enough
         here because the quads are well separated along the helix and never
         interpenetrate — the case where per-quad sorting breaks down. */
      for (let i = 0; i < count; i++) {
        const p = phase + i * HELIX_TWIST
        const dx = HELIX_RADIUS * Math.cos(p)
        const dy = i * HELIX_RISE - camY
        const dz = HELIX_RADIUS * Math.sin(p) - HELIX_CAMERA_DISTANCE
        depth[i] = dx * dx + dy * dy + dz * dz
      }
      order.sort((a, b) => depth[b] - depth[a])

      /* Hover, resolved before anything is drawn so the tilt and the glow are
         from the same frame as the geometry they are applied to.
         `picked` is compared against its own previous value rather than against
         `hover.index`, because those two deliberately disagree on the way out:
         the pointer has left, but the card it left still owns the glow that is
         fading off it, and has to keep owning it until the fade is done. Testing
         against `hover.index` would see a change every frame and restart the
         leave tween on each one, so it would never finish. */
      if (fine.matches) {
        const picked = pick(phase, camY)
        if (picked !== pickedLast) {
          if (picked >= 0) {
            hover.index = picked
            gsap.to(hover, { glow: 1, duration: 0.35, ease: 'power2.out' })
            // Positive is up: the rail's -6px is screen-space, and world Y here
            // points the other way.
            toLift(HELIX_LIFT)
          } else {
            gsap.to(hover, { glow: 0, duration: 0.4, ease: 'power3.out' })
            toTiltX(0)
            toTiltY(0)
            toLift(0)
            toGlowX(0.5)
            toGlowY(0.5)
          }
          // On the raw pick, not `hover.index`: the two disagree on the way
          // out by design (see above), and the cursor has to change the
          // instant the pointer leaves the card, not when the glow finishes
          // fading off it.
          onHoverRef.current?.(picked)
          pickedLast = picked
        }
        if (picked >= 0) {
          // Y negated: pushing the pointer down should tip the top of the card
          // away, not toward. The rail's own signs.
          toTiltY((hoverU * 2 - 1) * HELIX_TILT_Y)
          toTiltX(-(hoverV * 2 - 1) * HELIX_TILT_X)
          toGlowX(hoverU)
          toGlowY(hoverV)
        }
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      /* Then the cards, far to near. */
      gl.useProgram(cardProgram)
      gl.uniform1f(cardUniforms.phase, phase)
      gl.uniform3f(cardUniforms.camera, 0, camY, HELIX_CAMERA_DISTANCE)
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
      gl.enableVertexAttribArray(aCorner)
      gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0)

      for (const i of order) {
        if (!badgeReady[i]) continue
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, badgeTextures[i])
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, ghostReady[i] ? ghostTextures[i] : blank)

        gl.uniform1f(cardUniforms.index, i)
        gl.uniform1f(cardUniforms.scale, scales[i])
        gl.uniform1f(cardUniforms.focus, focuses[i])

        /* The boil, damped by focus exactly as the rail damps it: the card
           being read is the steadiest thing on screen rather than the busiest. */
        const boil = boilOffset(i, seconds, HELIX_BOIL * (1 - 0.6 * focuses[i]))
        gl.uniform2f(cardUniforms.boil, boil.x, boil.y)

        const hovered = hover.index === i
        gl.uniform3f(
          cardUniforms.tilt,
          hovered ? hover.tiltX : 0,
          hovered ? hover.tiltY : 0,
          hovered ? hover.lift : 0,
        )
        gl.uniform4f(
          cardUniforms.glow,
          hovered ? hover.glowX : 0.5,
          hovered ? hover.glowY : 0.5,
          hovered ? hover.glow : 0,
          hovered ? hover.glow : 0,
        )

        /* The shimmer's phase. Computed here rather than in the shader because
           it is one number per card and the CSS it reproduces is a keyframe
           timeline, not a formula — easier to keep honest in the language the
           original is written in. `-1 → 2` is the keyframes' translateX; the
           smoothstep stands in for `ease-in-out`, which it matches to within a
           couple of percent across the sweep. */
        const t = (seconds - i * SHIMMER_STAGGER) / SHIMMER_PERIOD
        const cycle = t - Math.floor(t)
        gl.uniform1f(cardUniforms.shimmer, -1 + 3 * (cycle * cycle * (3 - 2 * cycle)))

        /* A lifted card casts. Drawn immediately before its own card and only
           for the one being hovered, which is the only one with any lift — the
           rail's shadow is likewise keyed to `--lift` and so collapses to
           nothing at rest, which is the design as drawn.
           It goes first in this pair rather than in the sorted order because it
           belongs to *this* card: with no depth buffer, "behind" means "drawn
           just before", and anything further away has already been laid down. */
        const cast = hovered ? hover.glow : 0
        if (cast > 0.001) {
          gl.uniform1f(cardUniforms.shadow, cast)
          gl.drawArrays(gl.TRIANGLES, 0, 6)
          gl.uniform1f(cardUniforms.shadow, 0)
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      gl.disableVertexAttribArray(aCorner)

      const nearest = Math.max(0, Math.min(count - 1, Math.round(index)))
      if (nearest !== front) {
        front = nearest
        onFrontRef.current?.(nearest)
      }
    }

    gsap.ticker.add(render)

    return () => {
      disposed = true
      gsap.ticker.remove(render)
      gsap.killTweensOf(hover)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      gl.deleteBuffer(quadBuffer)
      if (blank) gl.deleteTexture(blank)
      for (const texture of badgeTextures) if (texture) gl.deleteTexture(texture)
      for (const texture of ghostTextures) if (texture) gl.deleteTexture(texture)
      gl.deleteProgram(cardProgram)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
    // `badges` and `onFront` are read through refs; `fog` and `targetRef` are
    // fixed for the life of the page. Rebuilding on any of them would mean a
    // fresh context and twenty-four fresh texture uploads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!supported) return <>{fallback}</>

  return <div ref={hostRef} aria-hidden className={className} />
}
