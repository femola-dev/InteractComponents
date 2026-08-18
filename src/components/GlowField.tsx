import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * The two coloured washes behind the Join Group screens, drawn live instead of
 * as a pair of exported blurs.
 *
 * This exists to sit *under* the backdrop-blurred plate, which changes what it
 * has to be good at. Nothing it draws survives to the screen unsoftened — a
 * 200px blur is between it and the viewer — so the job is to move two coloured
 * masses around convincingly, not to render a clean image. Two consequences,
 * both of which make this much cheaper than it looks:
 *
 *   - It renders at `RENDER_SCALE`, a third of CSS size. At 1920×1080 that is a
 *     640×360 buffer, and the blur erases the difference. Rendering at device
 *     resolution would cost nine times as much for something no one can see.
 *   - The noise is four octaves of value noise, not simplex. Its grid artefacts
 *     are exactly what a heavy blur eats first.
 *
 * The motion is a domain warp — the field's coordinates are themselves pushed
 * around by two chained noise lookups before it is sampled. That is what makes
 * the edges wander and fold rather than pulse in place, and it is why the
 * blobs never look like two circles breathing on a timer.
 *
 * The same blur that makes this cheap also sets how big the motion has to be,
 * which is the easy thing to get wrong: a 200px gaussian averages away
 * anything finer than about half a viewport, so a wash that drifts a hundred
 * pixels does not read as subtle, it reads as static. Every amplitude and
 * frequency in `main` is chosen to survive that, and they should be re-checked
 * against the blur if it ever changes.
 *
 * Nothing here reads input. The drift periods are 22, 28, 26 and 21 seconds and
 * share no common factor, so the composition keeps arriving somewhere it has
 * not been rather than looping visibly.
 */

/**
 * Buffer size as a fraction of CSS size. Straightforward quality-for-cost, and
 * the blur on top is what makes it free — raise it only if the field is ever
 * used somewhere it is seen directly.
 */
const RENDER_SCALE = 1 / 3

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uResolution;
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uCenterY;
uniform float uIntensity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Hermite rather than linear, so the derivative is continuous across cell
  // edges and the grid does not show up as creases under the warp.
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),                  hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  // 2.02 and not 2.0: an exact doubling lines every octave's grid up on the
  // same points and the sum develops visible axes through it.
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

/**
 * One wash. An ellipse in uv space rather than a circle in screen space, so it
 * stays 46% of the width and 30% of the height whatever the window's aspect —
 * the file's shapes are roughly 2:1 and a full-bleed wash should not turn into
 * a portrait blob on a narrow screen.
 *
 * The plateau out to 0.25 is what makes this read as a filled shape that was
 * blurred, which is what the exports are, rather than as a radial gradient.
 */
float wash(vec2 uv, vec2 c, vec2 radii, float warp) {
  float r = length((uv - c) / radii) + warp;
  return 1.0 - smoothstep(0.25, 1.15, r);
}

void main() {
  // WebGL's origin is bottom-left and every coordinate this is configured with
  // is top-down, matching CSS.
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y = 1.0 - uv.y;
  float t = uTime;

  // Everything below is sized against the 200px blur laid over this field, and
  // that constraint drives all of it. A gaussian that wide destroys anything
  // finer than roughly half a viewport, so motion only survives if it happens
  // at the scale of the whole composition. Small drift is not subtle here, it
  // is invisible — the blur averages it away before it reaches the screen.
  //
  // Hence: a low-frequency warp (features about a viewport across), and washes
  // that swing across a third of the screen and trade territory in the middle
  // rather than jiggling around a fixed point.
  vec2 p = uv * vec2(1.3, 0.9);
  vec2 q = vec2(fbm(p + t * 0.115),
                fbm(p + vec2(5.2, 1.3) - t * 0.098));
  vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + t * 0.086),
                fbm(p + 2.0 * q + vec2(8.3, 2.8) - t * 0.072));
  float warp = (fbm(p + 2.0 * r) - 0.5) * 0.85;

  vec2 cA = vec2(0.30 + 0.21 * sin(t * 0.280), uCenterY + 0.13 * cos(t * 0.221));
  vec2 cB = vec2(0.70 + 0.21 * cos(t * 0.243), uCenterY + 0.13 * sin(t * 0.307));

  // Opposed warp on the second wash so the pair never folds in lockstep.
  float a = wash(uv, cA, vec2(0.50, 0.34), warp);
  float b = wash(uv, cB, vec2(0.50, 0.34), -warp);

  gl_FragColor = vec4((uColorA * a + uColorB * b) * uIntensity, 1.0);
}
`

/**
 * Failures here are reported rather than swallowed. The fallback is the design's
 * own static exports, so a broken shader degrades into something that looks
 * deliberate — which is right for a user and useless for whoever is trying to
 * work out why the background stopped moving.
 */
function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[GlowField] shader failed to compile:', gl.getShaderInfoLog(shader))
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
    console.warn('[GlowField] program failed to link:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/** `#rrggbb` to three 0–1 floats. */
function toRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export type GlowFieldProps = {
  colorA: string
  colorB: string
  /** Where the band's centre sits: 0 is the top of the canvas, 1 the bottom. */
  centerY: number
  /** Peak strength of each wash, matching the exported fill's opacity. */
  intensity: number
  /** Drawn instead when WebGL is unavailable or the program fails to build. */
  fallback?: ReactNode
  className?: string
}

export function GlowField({
  colorA,
  colorB,
  centerY,
  intensity,
  fallback = null,
  className,
}: GlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      // This is a background. It has no business waking a discrete GPU.
      powerPreference: 'low-power',
    })
    if (!gl) {
      setSupported(false)
      return
    }

    const program = link(gl)
    if (!program) {
      setSupported(false)
      return
    }

    /* One triangle large enough to cover the clip volume, not two making a
       quad. A quad rasterises its shared diagonal twice and gives the GPU a
       seam to interpolate across; this has neither. */
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)
    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uTime = gl.getUniformLocation(program, 'uTime')

    gl.uniform3fv(gl.getUniformLocation(program, 'uColorA'), toRgb(colorA))
    gl.uniform3fv(gl.getUniformLocation(program, 'uColorB'), toRgb(colorB))
    gl.uniform1f(gl.getUniformLocation(program, 'uCenterY'), centerY)
    gl.uniform1f(gl.getUniformLocation(program, 'uIntensity'), intensity)

    const resize = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE))
      const height = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE))
      if (canvas.width === width && canvas.height === height) return
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.uniform2f(uResolution, width, height)
    }

    const draw = (seconds: number) => {
      gl.uniform1f(uTime, seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    /* An ambient full-screen animation is exactly what this query is for. The
       field still renders — the composition needs its colour — it just holds
       one frame instead of drifting. */
    const motionless = window.matchMedia('(prefers-reduced-motion: reduce)')
    const start = performance.now()
    let frame = 0

    resize()

    const observer = new ResizeObserver(() => {
      resize()
      /* Redraw immediately. Under reduced motion there is no loop to pick the
         new size up, and even with one this avoids a frame of stretched
         buffer during a drag-resize. */
      draw(motionless.matches ? 0 : (performance.now() - start) / 1000)
    })
    observer.observe(canvas)

    const loop = (now: number) => {
      draw((now - start) / 1000)
      frame = requestAnimationFrame(loop)
    }

    if (motionless.matches) draw(0)
    else frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      /* Contexts are a scarce per-page resource and are not collected
         promptly. The playground switcher can mount and drop this repeatedly. */
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [colorA, colorB, centerY, intensity])

  if (!supported) return <>{fallback}</>

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
