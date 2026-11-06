import {
  AdditiveBlending,
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

type Triple = readonly [number, number, number];

export interface Ground {
  root: Group;
  /* A shadow catcher under the piece in focus, on the full tier: the key light's shadow map falls on it. */
  catcher: Mesh | null;
  /* The contact shadow under each station, in the order of the stations. */
  contacts: Mesh[];
  dispose: () => void;
}

const SIZE = 128;

/* A soft radial falloff drawn once on a canvas: white at the centre, gone at the rim. */
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

function disc(material: MeshBasicMaterial, size: number, [x, y, z]: Triple): Mesh {
  const mesh = new Mesh(new PlaneGeometry(size, size), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.renderOrder = -1;
  return mesh;
}

/* The studio floor, which is never drawn as a surface: under each piece a faint pool of warm light and a
   contact shadow, so the paper sits in the room instead of floating on the page. */
export function createGround(stations: readonly Triple[], tier: QualityTier): Ground {
  const falloff = radial();
  const glow = new MeshBasicMaterial({
    map: falloff,
    color: new Color(1, 0.86, 0.66),
    transparent: true,
    opacity: 0.05,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const contact = new MeshBasicMaterial({
    map: falloff,
    color: new Color(0, 0, 0),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const root = new Group();
  const pools = stations.map(([x, , z]) => disc(glow, 6.5, [x, -0.02, z]));
  const contacts = stations.map(([x, , z]) => disc(contact, 2.2, [x, -0.01, z]));
  const meshes = [...pools, ...contacts];
  root.add(...meshes);
  const catcher =
    tier === "full"
      ? new Mesh(new PlaneGeometry(9, 9), new ShadowMaterial({ opacity: 0.42, depthWrite: false }))
      : null;
  if (catcher !== null) {
    catcher.rotation.x = -Math.PI / 2;
    catcher.receiveShadow = true;
    root.add(catcher);
  }
  return {
    root,
    catcher,
    contacts,
    dispose: () => {
      for (const mesh of [...meshes, ...(catcher === null ? [] : [catcher])]) {
        mesh.geometry.dispose();
      }
      catcher?.material.dispose();
      glow.dispose();
      contact.dispose();
      falloff.dispose();
    },
  };
}
