import {
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShadowMaterial,
  type Texture,
} from "three";

import type { QualityTier } from "../lib/quality-tier.ts";

/* The floor of the sign, never drawn as a surface: a soft contact shadow under each sheet, one under the
   finished sign and one under the pebble, each with its own opacity so a lifted sheet's shadow pales as it
   spreads; on the full tier, a faint catcher for the key light's shadows. */
type Contact = Mesh<PlaneGeometry, MeshBasicMaterial>;

export interface SignGround {
  root: Group;
  sheets: Contact[];
  sign: Contact;
  pebble: Contact;
  dispose: () => void;
}

/* The darkness of a contact shadow on the floor. */
export const CONTACT = 0.32;
/* The key light's shadows stay a breath on the Kome page: a lifted sheet's shape never reads as a hole. */
const CATCHER = 0.08;
const SIZE = 128;
const DISC = 2.6;

function radial(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d");
  const gradient = context?.createRadialGradient(
    SIZE / 2,
    SIZE / 2,
    0,
    SIZE / 2,
    SIZE / 2,
    SIZE / 2,
  );
  gradient?.addColorStop(0, "rgba(255,255,255,1)");
  gradient?.addColorStop(0.45, "rgba(255,255,255,0.45)");
  gradient?.addColorStop(1, "rgba(255,255,255,0)");
  if (context !== null && gradient !== undefined) {
    context.fillStyle = gradient;
    context.fillRect(0, 0, SIZE, SIZE);
  }
  return new CanvasTexture(canvas);
}

export function createSignGround(sheets: number, tier: QualityTier): SignGround {
  const falloff = radial();
  const geometry = new PlaneGeometry(DISC, DISC);
  function disc(): Contact {
    const material = new MeshBasicMaterial({
      map: falloff,
      color: new Color(0, 0, 0),
      transparent: true,
      opacity: CONTACT,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = -1;
    return mesh;
  }
  const discs = {
    sheets: Array.from({ length: sheets }, () => disc()),
    sign: disc(),
    pebble: disc(),
  };
  const root = new Group();
  root.add(...discs.sheets, discs.sign, discs.pebble);
  const catcher =
    tier === "full"
      ? new Mesh(
          new PlaneGeometry(9, 9),
          new ShadowMaterial({ opacity: CATCHER, depthWrite: false }),
        )
      : null;
  if (catcher !== null) {
    catcher.rotation.x = -Math.PI / 2;
    catcher.receiveShadow = true;
    root.add(catcher);
  }
  return {
    root,
    ...discs,
    dispose: () => {
      for (const mesh of [...discs.sheets, discs.sign, discs.pebble]) {
        mesh.material.dispose();
      }
      geometry.dispose();
      catcher?.geometry.dispose();
      catcher?.material.dispose();
      falloff.dispose();
    },
  };
}
