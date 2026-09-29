import { useEffect, useRef, useState } from 'react';

// Liquid, water-like hero background rendered with a tiny WebGL fragment shader.
// - Domain-warped fractal noise makes the colors flow and swirl like fluid.
// - Thin caustic bands shimmer inside the colored areas (light through water).
// - The pointer sends ripples through the surface that calm down when it stops.
// Falls back to the CSS aurora if WebGL is unavailable; renders a single still
// frame when the user prefers reduced motion.

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uEnergy;
uniform vec3 uBg;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uStrength;
uniform float uCaustic;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Gradient noise
float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * gnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Aspect-correct coordinates centered on the canvas
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  // Pointer ripples: concentric waves + a gentle lens pull around the cursor
  vec2 m = (uMouse * uRes - 0.5 * uRes) / uRes.y;
  vec2 dv = p - m;
  float d = length(dv);
  vec2 dir = dv / (d + 1e-4);
  p += dir * sin(d * 22.0 - uTime * 3.0) * exp(-d * 4.0) * 0.045 * uEnergy;
  p -= dv * exp(-d * d * 7.0) * 0.18 * uEnergy;

  // Domain warping: noise feeding into noise gives the liquid swirl
  float t = uTime * 0.05;
  vec2 sp = p * 1.3;
  vec2 q = vec2(fbm(sp + vec2(0.0, t)), fbm(sp + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(sp + 3.0 * q + vec2(1.7, 9.2) + 1.3 * t),
    fbm(sp + 3.0 * q + vec2(8.3, 2.8) - 1.1 * t)
  );
  float f = fbm(sp + 3.0 * r);
  float n = clamp(f * 1.6 + 0.5, 0.0, 1.0);

  vec3 fluid = mix(uC1, uC2, clamp(length(q) * 1.4, 0.0, 1.0));
  fluid = mix(fluid, uC3, clamp(r.y * r.y * 3.0, 0.0, 1.0));
  float amt = smoothstep(0.2, 0.95, n) * uStrength;
  vec3 col = mix(uBg, fluid, amt);

  // Caustics: thin bright bands that drift through the colored regions
  float band = 1.0 - abs(sin(n * 16.0 + uTime * 0.4));
  col += pow(band, 18.0) * uCaustic * fluid * amt;

  gl_FragColor = vec4(col, 1.0);
}
`;

type Vec3 = [number, number, number];
interface Palette {
  bg: Vec3;
  c1: Vec3;
  c2: Vec3;
  c3: Vec3;
  strength: number;
  caustic: number;
}

// Colors mirror the theme tokens in theme.css
const DARK: Palette = {
  bg: [0.043, 0.055, 0.078], // --bg #0b0e14
  c1: [0.357, 0.486, 1.0], // --accent-strong #5b7cff
  c2: [0.769, 0.71, 0.992], // --purple #c4b5fd
  c3: [0.404, 0.91, 0.976], // --cyan #67e8f9
  strength: 0.55,
  caustic: 0.9,
};
const LIGHT: Palette = {
  bg: [0.965, 0.973, 0.988], // --bg #f6f8fc
  c1: [0.302, 0.427, 1.0], // #4d6dff
  c2: [0.655, 0.545, 0.98], // #a78bfa
  c3: [0.133, 0.827, 0.933], // #22d3ee
  strength: 0.32,
  caustic: 0.5,
};

// Render below native resolution; the soft, blurry look hides it and it's much cheaper.
const RENDER_SCALE = 0.5;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader failed');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log ?? 'shader compile failed');
  }
  return shader;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function HeroFluid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    // --- program ---
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram();
      if (!program) throw new Error('createProgram failed');
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? 'program link failed');
      }
    } catch (err) {
      console.warn('[HeroFluid] WebGL unavailable, falling back to CSS aurora:', err);
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    // Full-screen triangle
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program!, name);
    const uRes = u('uRes');
    const uTime = u('uTime');
    const uMouse = u('uMouse');
    const uEnergy = u('uEnergy');
    const uBg = u('uBg');
    const uC1 = u('uC1');
    const uC2 = u('uC2');
    const uC3 = u('uC3');
    const uStrength = u('uStrength');
    const uCaustic = u('uCaustic');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- theme: cross-fade the palette when data-theme changes ---
    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';
    let target: Palette = isLight() ? LIGHT : DARK;
    const cur: Palette = {
      bg: [...target.bg],
      c1: [...target.c1],
      c2: [...target.c2],
      c3: [...target.c3],
      strength: target.strength,
      caustic: target.caustic,
    };

    // --- pointer: smoothed position + "energy" that spikes on movement and decays ---
    const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 };
    let energy = reduced ? 0 : 0.15;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1 - (e.clientY - rect.top) / rect.height; // GL y goes up
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
      energy = Math.min(1, energy + Math.hypot(nx - mouse.tx, ny - mouse.ty) * 6);
      mouse.tx = nx;
      mouse.ty = ny;
    };

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (time: number) => {
      const k = reduced ? 1 : 0.06;
      for (const key of ['bg', 'c1', 'c2', 'c3'] as const) {
        for (let i = 0; i < 3; i++) cur[key][i] = lerp(cur[key][i], target[key][i], k);
      }
      cur.strength = lerp(cur.strength, target.strength, k);
      cur.caustic = lerp(cur.caustic, target.caustic, k);

      mouse.x = lerp(mouse.x, mouse.tx, 0.06);
      mouse.y = lerp(mouse.y, mouse.ty, 0.06);
      if (!reduced) energy = Math.max(0.15, energy * 0.97);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uEnergy, energy);
      gl.uniform3fv(uBg, cur.bg);
      gl.uniform3fv(uC1, cur.c1);
      gl.uniform3fv(uC2, cur.c2);
      gl.uniform3fv(uC3, cur.c3);
      gl.uniform1f(uStrength, cur.strength);
      gl.uniform1f(uCaustic, cur.caustic);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const STILL_TIME = 12; // frame used when motion is reduced
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      draw((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const mo = new MutationObserver(() => {
      target = isLight() ? LIGHT : DARK;
      if (reduced) draw(STILL_TIME);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const ro = new ResizeObserver(() => {
      resize();
      // Redraw synchronously right after resizing. Changing canvas.width/height
      // clears the drawing buffer to black, and while the layout transition
      // animates the width every frame, waiting for the next rAF leaves a black
      // flash. Drawing now keeps the surface filled at all times.
      draw(reduced ? STILL_TIME : (performance.now() - start) / 1000);
    });
    ro.observe(canvas);
    resize();

    // Pause rendering while the hero is scrolled out of view
    const io = new IntersectionObserver(([entry]) => {
      if (reduced) return;
      if (entry.isIntersecting) startLoop();
      else stopLoop();
    });
    io.observe(canvas);

    const onLost = (e: Event) => {
      e.preventDefault();
      stopLoop();
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    if (reduced) {
      draw(STILL_TIME);
    } else {
      window.addEventListener('pointermove', onMove, { passive: true });
      startLoop();
    }

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  if (failed) {
    return (
      <div className="hero__aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }
  return <canvas ref={canvasRef} className="hero__fluid" aria-hidden="true" />;
}
