import { CREASE_UNIFORM_SLOTS } from "./paper-crumple-geometry.ts";

/* The vertex displacement for the crumpled sheet, injected into MeshStandardMaterial through onBeforeCompile.
   Technique reimplemented from React Bits `PaperCrumple` (MIT + Commons Clause), not copied: a height field over the
   sheet's UV from the packed creases and the pointer dent, scaled by uCrumple; the normal is recomputed from the
   field's gradient (central differences) so the folds catch the light. */

/* The height of the sheet at a UV point: each crease is a signed fold ridge along its line, the pointer presses a soft
   dent, and uCrumple scales the whole relief from flat (0) to balled (1). Depth 0 marks an unused crease slot. */
export const CRUMPLE_HEIGHT_FUNCTION = `
  uniform float uCrumple;
  uniform vec4 uCreases[${CREASE_UNIFORM_SLOTS}];
  uniform vec2 uPointer;
  uniform float uPointerActive;

  float crumpleHeight(vec2 uv) {
    float height = 0.0;
    for (int i = 0; i < ${CREASE_UNIFORM_SLOTS}; i++) {
      vec4 crease = uCreases[i];
      if (crease.w <= 0.0) continue;
      vec2 dir = vec2(cos(crease.z), sin(crease.z));
      float signedDistance = dot(uv - crease.xy, vec2(-dir.y, dir.x));
      /* A sharp ridge that falls off with distance: a fold, not a wave. */
      height += crease.w * 0.06 * sin(signedDistance * 40.0) * exp(-abs(signedDistance) * 10.0);
    }
    float pointerDent = -uPointerActive * 0.08 * exp(-distance(uv, uPointer) * 14.0);
    return (height + pointerDent) * uCrumple;
  }
`;

/* Replaces `#include <beginnormal_vertex>`: the sheet's UV is read from the plane's own position (a unit plane spans
   -0.5..0.5), so no `uv` attribute is required. The normal is the field's gradient (central differences); three's
   `defaultnormal_vertex` then turns objectNormal into transformedNormal as usual. crumpleH is reused by the position
   chunk, which the template runs next in the same main(). */
export const CRUMPLE_NORMAL_CHUNK = `
  vec2 crumpleUv = position.xy + 0.5;
  float crumpleEps = 0.004;
  float crumpleH = crumpleHeight(crumpleUv);
  float crumpleHx = crumpleHeight(crumpleUv + vec2(crumpleEps, 0.0));
  float crumpleHy = crumpleHeight(crumpleUv + vec2(0.0, crumpleEps));
  vec3 objectNormal = normalize(vec3(
    -(crumpleHx - crumpleH) / crumpleEps,
    -(crumpleHy - crumpleH) / crumpleEps,
    1.0
  ));
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
  #endif
`;

/* Replaces `#include <begin_vertex>`: displaces the vertex out of the sheet's plane by the height field. */
export const CRUMPLE_POSITION_CHUNK = `
  vec3 transformed = vec3(position);
  transformed.z += crumpleH;
`;
