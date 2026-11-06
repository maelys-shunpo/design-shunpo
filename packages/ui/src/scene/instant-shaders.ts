/* The ink of the Instant scene. Each particle holds its place on a drawing, then jumps to the next one inside a
   short window of the scroll: still, then instant. Its own moment in that window comes from its seed, so the page
   redraws itself in one sweep. Ghost layers draw the same particle a little earlier in the jump, fading: the
   trail of the step. Positions live in the drawing frame (-1..1) and are placed on the canvas by uLayout. */

export const INSTANT_VERTEX = `
  attribute vec2 aWeek;
  attribute vec2 aTools;
  attribute vec2 aSystem;
  attribute vec2 aTime;
  attribute float aSeed;
  attribute float aRed;

  uniform float uProgress;
  uniform float uTime;
  uniform float uLag;
  uniform float uAspect;
  uniform vec3 uLayout;
  uniform vec3 uPointer;
  uniform float uPointSize;
  uniform vec3 uInk;
  uniform vec3 uSeal;

  varying vec3 vColor;
  varying float vAlpha;

  /* Where in its segment a particle leaves, and how long it takes to land: a small share of the scroll. */
  const float LEAVE = 0.34;
  const float SPREAD = 0.22;
  const float FLIGHT = 0.07;

  float jump(float local) {
    float t = clamp(local, 0.0, 1.0);
    return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 5.0) / 2.0;
  }

  vec2 drawing(float index) {
    if (index < 0.5) return aWeek;
    if (index < 1.5) return aTools;
    if (index < 2.5) return aSystem;
    return aTime;
  }

  void main() {
    float segment = clamp(uProgress, 0.0, 1.0) * float(DRAWINGS - 1);
    float layer = min(floor(segment), float(DRAWINGS - 2));
    float local = segment - layer;
    float leave = LEAVE + aSeed * SPREAD;
    float travel = jump((local - uLag - leave) / FLIGHT);
    vec2 from = drawing(layer);
    vec2 to = drawing(layer + 1.0);
    vec2 position = mix(from, to, travel);

    /* The step bends a little, each particle to its own side, and lands with no drift. */
    vec2 path = to - from;
    vec2 side = vec2(-path.y, path.x);
    float flight = sin(travel * 3.14159265);
    position += side * flight * (aSeed - 0.5) * 0.18;

    /* Breathing: the ink never quite stops. */
    position += 0.0035 * vec2(sin(uTime * 0.8 + aSeed * 41.0), cos(uTime * 0.7 + aSeed * 29.0));

    /* Life at rest, absent from the first frame (uTime 0.1, the poster) and grown over a second and a half:
       the drawing sways a little, region by region, and a wave of ink soaks slowly across the paper. */
    float life = smoothstep(0.1, 1.6, uTime);
    position += life * 0.014 * vec2(sin(uTime * 1.1 + position.y * 3.1), cos(uTime * 0.9 + position.x * 2.7));
    float soak = life * 0.35 * sin(uTime * 1.5 - (position.x * 2.2 + position.y * 1.4));

    vec2 placed = vec2(uLayout.x + position.x * uLayout.z / uAspect, uLayout.y + position.y * uLayout.z);

    /* The pointer parts the ink, measured in the canvas's own proportions. */
    vec2 away = (placed - uPointer.xy) * vec2(uAspect, 1.0);
    float reach = exp(-dot(away, away) / 0.018);
    placed += normalize(away + vec2(1e-5)) / vec2(uAspect, 1.0) * reach * uPointer.z * 0.085;

    gl_Position = vec4(placed, 0.0, 1.0);

    float lastStep = step(float(DRAWINGS - 2), layer);
    float redden = aRed * lastStep * travel;
    vColor = mix(uInk, uSeal, redden);
    float ghost = step(0.0001, uLag);
    vAlpha = mix(0.86 * (1.0 + soak), 0.42 * flight, ghost);
    gl_PointSize = uPointSize * (0.78 + 0.44 * fract(aSeed * 97.0)) * mix(1.0, 0.8, ghost);
  }
`;

export const INSTANT_FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float alpha = smoothstep(0.5, 0.32, length(gl_PointCoord - 0.5)) * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
    #include <colorspace_fragment>
  }
`;
