import {
  AmbientLight,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  type PlaneGeometry,
  SRGBColorSpace,
  Vector2,
  type Vector4,
} from "three";

import { type Rgb, resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { buildCrumpleGeometry, packCreases } from "./paper-crumple-geometry.ts";
import {
  CRUMPLE_HEIGHT_FUNCTION,
  CRUMPLE_NORMAL_CHUNK,
  CRUMPLE_POSITION_CHUNK,
} from "./paper-crumple-shaders.ts";

export interface PaperCrumpleUniforms {
  uCrumple: { value: number };
  uCreases: { value: Vector4[] };
  uPointer: { value: Vector2 };
  uPointerActive: { value: number };
}

export interface PaperCrumpleWorld {
  root: Group;
  mesh: Mesh<PlaneGeometry, MeshStandardMaterial>;
  material: MeshStandardMaterial;
  uniforms: PaperCrumpleUniforms;
  resources: ReadonlyArray<{ dispose: () => void }>;
}

/* The token resolves to an sRGB triple; tell three it is sRGB so the renderer's output encoding keeps the paper's
   tone (a bare `new Color(r, g, b)` would be read as linear and lighten it). */
function toColor([red, green, blue]: Rgb): Color {
  return new Color().setRGB(red / 255, green / 255, blue / 255, SRGBColorSpace);
}

/* The 404 sheet: a subdivided paper plane whose vertices fold in the shader. The canvas is transparent, so the plane
   is the only object; a soft key light from the top left and an ambient fill let the creases read. The uniforms are
   shared with the material through onBeforeCompile and written each frame by `posePaperCrumple`. */
export function createPaperCrumpleWorld(
  canvas: HTMLCanvasElement,
  tier: QualityTier,
): PaperCrumpleWorld {
  const { geometry } = buildCrumpleGeometry(tier);
  const material = new MeshStandardMaterial({
    color: toColor(resolveColor(canvas, "--color-agents-paper")),
    roughness: 0.92,
    metalness: 0,
    side: DoubleSide,
  });

  const uniforms: PaperCrumpleUniforms = {
    uCrumple: { value: 0 },
    uCreases: { value: packCreases([]) },
    uPointer: { value: new Vector2(0.5, 0.5) },
    uPointerActive: { value: 0 },
  };

  Object.assign(material, {
    onBeforeCompile: (shader: { uniforms: object; vertexShader: string }) => {
      Object.assign(shader.uniforms, uniforms);
      Object.assign(shader, {
        vertexShader: shader.vertexShader
          .replace("#include <common>", `#include <common>\n${CRUMPLE_HEIGHT_FUNCTION}`)
          .replace("#include <beginnormal_vertex>", CRUMPLE_NORMAL_CHUNK)
          .replace("#include <begin_vertex>", CRUMPLE_POSITION_CHUNK),
      });
    },
    customProgramCacheKey: () => "paper-crumple",
  });

  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const key = new DirectionalLight(0xffffff, 1.3);
  key.position.set(-2, 3, 4);
  key.castShadow = true;
  const fill = new AmbientLight(0xffffff, 0.55);

  const root = new Group();
  root.add(mesh, key, fill);

  return { root, mesh, material, uniforms, resources: [geometry, material] };
}

export function disposePaperCrumpleWorld(world: PaperCrumpleWorld): void {
  for (const resource of world.resources) {
    resource.dispose();
  }
}
