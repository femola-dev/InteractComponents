import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { SPIN_DISTANCE, SPIN_FOCAL, SPIN_PERIOD, SPIN_RAMP } from '../lib/writersGarden'

/**
 * The Writers Garden panel's badge, turning about its vertical axis for as long
 * as the panel is open.
 *
 * WebGL rather than a CSS `rotateY`, and the difference is not the rotation —
 * `transform: perspective() rotateY()` produces the same silhouette for a
 * fraction of the code. It is the three things a DOM transform cannot do to a
 * flat bitmap, all of which are the point of turning a *badge* rather than a
 * card:
 *
 *   - **It is lit.** The quad carries a normal, so the enamel brightens as it
 *     swings toward the light and falls off as it turns away. A CSS rotation
 *     moves a fixed bitmap; this one changes value as it moves, which is what
 *     makes it read as an object under a lamp instead of a picture on a hinge.
 *   - **It has a back.** At 180° a rotated `<img>` shows the artwork mirrored,
 *     which is the one thing a struck badge definitely does not look like from
 *     behind. Here the reverse is the same silhouette in plain metal.
 *   - **Its edge catches.** A zero-thickness quad has no width at 90°, and
 *     rather than hide that, a rim term brightens it as it goes over — which is
 *     what the milled edge of a real badge does when it passes the light.
 *
 * GSAP owns the timing, the renderer owns the pixels, and the two meet at one
 * number. The spin is a single repeating tween on a plain object, so it can be
 * brought up from rest by tweening its own `timeScale` and killed outright when
 * the panel closes. The draw call is registered on `gsap.ticker` rather than on
 * its own `requestAnimationFrame` — the page already runs GSAP for the rail's
 * tilt, and a second rAF loop would interleave with that one rather than share
 * a frame with it.
 *
 * Everything degrades to the caller's `fallback`: no WebGL context, a shader
 * that will not build, or `prefers-reduced-motion`. The last is not a nicety —
 * an unprompted, unending rotation is close to the canonical example of what
 * that query exists to switch off.
 */

/**
 * The rasterised badge, per side, in texels.
 *
 * Power-of-two so it can carry a full mip chain, which is the whole reason for
 * the choice: side-on, the badge is squeezed into a couple of dozen pixels
 * across, and minifying a 512px texture without mips is how you get the edges
 * crawling and sparkling through every turn. 512 covers the ~128px box at 2×
 * device pixels with a stop of headroom.
 */
const TEXTURE_SIZE = 512

const VERTEX = `
attribute vec2 aPos;

uniform float uAngle;
uniform float uAspect;

varying vec2  vUv;
varying vec3  vNormal;
varying vec3  vView;

void main() {
  vUv = aPos * 0.5 + 0.5;

  float c = cos(uAngle);
  float s = sin(uAngle);

  // A unit quad turned about Y, then pushed away from a camera sitting at the
  // origin looking down -Z.
  vec3 p = vec3(aPos.x * c, aPos.y, -aPos.x * s);
  p.z -= ${SPIN_DISTANCE.toFixed(1)};

  // The quad's own +Z, carried through the same rotation.
  vNormal = vec3(s, 0.0, c);
  vView = -p;

  // No projection matrix and no depth buffer: there is exactly one quad here,
  // so the only thing a perspective matrix would contribute is the divide, and
  // putting view-space depth straight into w does that. z is pinned at 0, which
  // is inside the clip volume for every w > 0 — and w is ~6 for every vertex.
  gl_Position = vec4(
    p.x * ${SPIN_FOCAL.toFixed(6)} / uAspect,
    p.y * ${SPIN_FOCAL.toFixed(6)},
    0.0,
    -p.z
  );
}
`

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uTexA;
uniform sampler2D uTexB;
/** 0 shows unit A, 1 shows unit B. Tweened on a badge change. */
uniform float uMix;
uniform vec3  uLight;
uniform vec3  uBack;

varying vec2  vUv;
varying vec3  vNormal;
varying vec3  vView;

/* Held gentle on purpose. The export is already a shaded illustration with its
   own highlights baked in, so this is a wash over the top of someone else's
   lighting, not a lighting model in its own right.

   AMBIENT is not a free parameter: at rest the badge has to match the static
   image the panel draws before this loads, and the rail's copy beside it. Face
   on, N is (0,0,1) and lambert is uLight.z / |uLight| = 0.7197, so
   0.80 + 0.28 × 0.7197 = 1.0015 — the texture, essentially untouched. Turning
   away from there darkens it to 0.80 and toward it lifts to 1.08. */
const float AMBIENT = 0.80;
const float DIFFUSE = 0.28;
const float SHININESS = 42.0;
const float SPECULAR = 0.55;

/* The rim, which is what sells the pass through side-on.
   It keys on the angle between the face and the viewer rather than on the
   light, so it is zero face-on — |dot(N,V)| is 1, and 1 minus that is 0 — and
   climbs as the badge turns away: about 0.03 at 60°, 0.21 at 80°, full at 90°.
   That distribution is the whole trick. A flash at exactly 90° would be
   invisible, because at 90° the quad covers no pixels to flash; the badge has
   to start catching while it still has some width left. */
const float RIM = 0.45;
const float RIM_FALLOFF = 4.0;

void main() {
  bool front = gl_FrontFacing;

  /* The back of the quad shows the same texture mirrored — which is right for
     the *silhouette* and wrong for everything inside it. uv.y flips because the
     texture arrives from a 2D canvas, which is top-down where GL is not. */
  vec2 uv = front ? vUv : vec2(1.0 - vUv.x, vUv.y);
  uv.y = 1.0 - uv.y;

  /* Both textures are premultiplied, so a straight mix between them is the
     correct cross-dissolve — no divide-out, and no dark fringe where one is
     transparent and the other is not. */
  vec4 tex = mix(texture2D(uTexA, uv), texture2D(uTexB, uv), uMix);

  vec3 N = normalize(front ? vNormal : -vNormal);
  vec3 L = normalize(uLight);
  vec3 V = normalize(vView);
  vec3 H = normalize(L + V);

  float lambert = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), SHININESS) * SPECULAR;
  float rim = pow(1.0 - abs(dot(N, V)), RIM_FALLOFF) * RIM;

  vec3 rgb;
  float alpha;

  if (front) {
    rgb = tex.rgb * (AMBIENT + DIFFUSE * lambert);
    alpha = tex.a;
  } else {
    /* The reverse: plain metal in the badge's outline.
       Thresholded rather than taken straight, because the export's alpha is not
       only the badge — it carries the design's drop shadow, a few tenths of a
       unit out at the edges. Read from the front that shadow is the point; read
       from behind it would silhouette as a soft dark halo around a solid disc.
       0.55–0.8 keeps the struck body and drops the shadow. */
    alpha = smoothstep(0.55, 0.8, tex.a);
    rgb = uBack * (AMBIENT + DIFFUSE * lambert) * alpha;
  }

  // Both additive terms are scaled by alpha to stay premultiplied — an
  // unscaled highlight would glow in the badge's transparent margin.
  gl_FragColor = vec4(rgb + (spec + rim) * alpha, alpha);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[SpinningBadge] shader failed to compile:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function link(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  if (!vertex || !fragment) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  // Attached shaders are reference-counted, so they are freed with the program.
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[SpinningBadge] program failed to link:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/**
 * Rasterise an SVG URL into a texture unit.
 *
 * The badges are 294×294 with a viewBox, so they redraw crisply at whatever
 * size is asked for rather than being resampled up from an intrinsic one. The
 * intermediate 2D canvas is what makes that possible: `texImage2D` will not
 * reliably take an `<img>` holding an SVG, because an SVG has no one true pixel
 * size for it to take.
 */
async function upload(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  unit: number,
  src: string,
  anisotropy: number,
) {
  const image = new Image()
  image.decoding = 'async'
  /* Asked for at texture size rather than left at the file's own 294.
     An SVG's intrinsic size is only a default — it has a viewBox, so it can be
     rasterised at any resolution — but a browser will happily rasterise at that
     default and then resample up into whatever `drawImage` asks for. Stating
     the size here is what gets it drawn at 512 instead of enlarged to it. */
  image.width = TEXTURE_SIZE
  image.height = TEXTURE_SIZE
  image.src = src
  await image.decode()

  const scratch = document.createElement('canvas')
  scratch.width = TEXTURE_SIZE
  scratch.height = TEXTURE_SIZE
  const ctx = scratch.getContext('2d')
  if (!ctx) return
  ctx.drawImage(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE)

  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  /* `texImage2D` reads a canvas as if by `getImageData`, which is
     unpremultiplied, so this is what premultiplies it on the way in — and the
     blend mode, the mip chain and the cross-dissolve in the shader all assume
     it has been. */
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scratch)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (anisotropy > 1) {
    /* Mips fix the sparkle and introduce a blur, because minification is
       isotropic: a badge squeezed to a tenth of its width horizontally and none
       of it vertically drops to the mip chosen for the worse axis and goes soft
       in both. A quad edge-on to the camera is the textbook case for the
       extension that exists to undo exactly that. */
    const ext = gl.getExtension('EXT_texture_filter_anisotropic')
    if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy)
  }
}

/** Everything the badge-change effect needs to reach without rebuilding. */
type Scene = {
  gl: WebGLRenderingContext
  program: WebGLProgram
  canvas: HTMLCanvasElement
  textures: [WebGLTexture, WebGLTexture]
  anisotropy: number
  /** Read by the draw call each frame; tweened by GSAP on a badge change. */
  mix: { value: number }
  /** Which unit is on screen. */
  slot: number
  /** What is in, or on its way into, the current slot. `null` until the first
   *  upload is claimed, which is how the first load is told from a change. */
  currentSrc: string | null
  /** False until something has actually been drawn worth showing. */
  revealed: boolean
}

export type SpinningBadgeProps = {
  /** The badge SVG. Changing it cross-dissolves rather than remounting. */
  src: string
  /** CSS size of the square canvas. Larger than the badge itself — see
   *  `SPIN_HEADROOM`, which is the caller's business, not this component's. */
  size: number
  /** Colour of the reverse. */
  back: string
  /** Drawn instead when WebGL, the shader, or the user's settings rule out a
   *  continuous rotation. */
  fallback: ReactNode
  className?: string
  style?: CSSProperties
}

export function SpinningBadge({
  src,
  size,
  back,
  fallback,
  className,
  style,
}: SpinningBadgeProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const [supported, setSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  /* Built once and torn down once. Deliberately no dependencies: `src` is
     handled by its own effect below and `back` by the one after it, because
     rebuilding the context on either would leak a WebGL context per turn of the
     rail — and a page gets about sixteen before the browser starts dropping the
     oldest one out from under whatever is still using it. */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    /* The canvas is created here rather than rendered by React, and that is
       load-bearing under StrictMode.
       Cleanup calls `loseContext()` — it has to, contexts are scarce — but a
       lost context is *sticky*: `getContext` on the same element afterwards
       hands back the same dead object, every call on it a silent no-op. React's
       development double-invoke would therefore build the scene, lose it, and
       rebuild onto the corpse, and the badge would simply never appear in dev.
       A canvas per effect run has no such history. */
    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    /* Hidden until the first texture lands. An unloaded WebGL texture samples
       as opaque black, so the alternative is a black square on the panel for
       however long the SVG takes to decode. */
    canvas.style.opacity = '0'
    host.append(canvas)

    const fail = () => {
      canvas.remove()
      setSupported(false)
    }

    const gl = canvas.getContext('webgl', {
      alpha: true,
      // The badge is a hard-edged shape on an otherwise typographic surface.
      // Without this its outline is the one aliased thing in the panel.
      antialias: true,
      depth: false,
      stencil: false,
      // One 170px quad. It has no business waking a discrete GPU.
      powerPreference: 'low-power',
    })
    if (!gl) {
      fail()
      return
    }

    const program = link(gl)
    const texA = gl.createTexture()
    const texB = gl.createTexture()
    if (!program || !texA || !texB) {
      fail()
      return
    }

    /* Two triangles, not GlowField's single oversized one: that trick works for
       a full-screen pass where the excess is clipped away, and here the geometry
       *is* the subject — the quad's own corners are what rotate.
       Wound counter-clockwise, so `gl_FrontFacing` is true at rest and flips
       with the quad at 180°, which is what selects the reverse. */
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)

    /* Premultiplied blending, matching how the textures are uploaded. The usual
       SRC_ALPHA / ONE_MINUS_SRC_ALPHA pair would apply alpha twice and leave a
       dark rim wherever the badge's shadow fades out. */
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    /* Both faces draw. Culling the back is the default instinct and exactly
       wrong here — the back face is half of the animation. */
    gl.disable(gl.CULL_FACE)

    const uAngle = gl.getUniformLocation(program, 'uAngle')
    const uAspect = gl.getUniformLocation(program, 'uAspect')
    const uMix = gl.getUniformLocation(program, 'uMix')

    gl.uniform1i(gl.getUniformLocation(program, 'uTexA'), 0)
    gl.uniform1i(gl.getUniformLocation(program, 'uTexB'), 1)
    /* Up, left and toward the viewer — the direction the badges' own baked
       highlights already come from, so the two agree rather than fight. */
    gl.uniform3f(gl.getUniformLocation(program, 'uLight'), -0.35, 0.6, 0.72)

    const ext = gl.getExtension('EXT_texture_filter_anisotropic')
    const anisotropy = ext
      ? Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT))
      : 1

    const mix = { value: 0 }
    const scene: Scene = {
      gl,
      program,
      canvas,
      textures: [texA, texB],
      anisotropy,
      mix,
      slot: 0,
      currentSrc: null,
      revealed: false,
    }
    sceneRef.current = scene

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texA)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, texB)

    /* The one number GSAP and the renderer share. A tween on a plain object
       rather than on the DOM: nothing here is a style, and routing it through
       CSS would mean parsing a string back into a float sixty times a second. */
    const spin = { angle: 0 }
    const turn = gsap.to(spin, {
      angle: Math.PI * 2,
      duration: SPIN_PERIOD,
      // Linear, and it has to be. Any easing on a tween that repeats puts a
      // stall at the seam — the badge would slow to a halt every revolution and
      // pick up again, which reads as a stutter rather than as a rhythm.
      ease: 'none',
      repeat: -1,
    })

    /* Up to speed rather than at speed. `timeScale` is the right handle for it:
       easing the *rate* keeps the rotation itself perfectly linear, where easing
       the angle would deform the first revolution into a slow-in. */
    turn.timeScale(0)
    const ramp = gsap.to(turn, { timeScale: 1, duration: SPIN_RAMP, ease: 'power2.out' })

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width === width && canvas.height === height) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.uniform1f(uAspect, width / height)
    }

    const render = () => {
      resize()
      gl.uniform1f(uAngle, spin.angle)
      gl.uniform1f(uMix, mix.value)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    /* On GSAP's ticker, not a private rAF. The rail's tilt already runs on it,
       so this shares that frame instead of racing it — and it means the spin
       stops with the rest of the page's motion rather than on its own terms. */
    gsap.ticker.add(render)

    return () => {
      gsap.ticker.remove(render)
      turn.kill()
      ramp.kill()
      gsap.killTweensOf(canvas)
      gsap.killTweensOf(mix)
      sceneRef.current = null
      gl.deleteBuffer(buffer)
      gl.deleteTexture(texA)
      gl.deleteTexture(texB)
      gl.deleteProgram(program)
      /* Contexts are a scarce per-page resource and are not collected promptly.
         This one mounts and drops every time the panel is opened. */
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [])

  /**
   * The first load, and every badge change after it, without touching the
   * context.
   *
   * The panel follows whichever badge is centred, so the rail can swap this out
   * mid-turn. New art goes into whichever unit is not on screen and `uMix` is
   * tweened across, so the badge dissolves into the next one without breaking
   * stride — the only version of this that does not look like a reset.
   *
   * `currentSrc` is claimed before the await rather than after, so a second
   * change arriving while the first is still decoding sees a different value
   * and takes the other unit instead of racing for the same one.
   */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || scene.currentSrc === src) return

    const first = scene.currentSrc === null
    const next = first ? 0 : 1 - scene.slot
    scene.currentSrc = src
    let cancelled = false

    void upload(scene.gl, scene.textures[next], next, src, scene.anisotropy).then(() => {
      // The scene check matters as much as the cancel: in StrictMode the setup
      // effect runs twice, and the promise from the first pass can land after
      // its context has already been dropped.
      if (cancelled || sceneRef.current !== scene) return
      scene.slot = next
      if (first) scene.mix.value = 0
      else gsap.to(scene.mix, { value: next, duration: 0.34, ease: 'power2.inOut' })

      /* Reveal on whichever upload lands first, not specifically on the first
         one requested. If the rail moved while the opening badge was still
         decoding, that first request is cancelled — and gating the fade on it
         would leave the canvas at opacity 0 for good. */
      if (!scene.revealed) {
        scene.revealed = true
        gsap.to(scene.canvas, { opacity: 1, duration: 0.24, ease: 'power2.out' })
      }
    })

    return () => {
      cancelled = true
    }
  }, [src])

  /** Its own effect so a change of reverse does not rebuild the context. */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    scene.gl.useProgram(scene.program)
    scene.gl.uniform3fv(
      scene.gl.getUniformLocation(scene.program, 'uBack'),
      toRgb(back),
    )
  }, [back])

  if (!supported) return <>{fallback}</>

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={className}
      style={{ ...style, width: size, height: size }}
    />
  )
}

/** `#rrggbb` to three 0–1 floats. */
function toRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
