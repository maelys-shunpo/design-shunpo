import {
  DirectionalLight,
  HemisphereLight,
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

/* The studio floor, which is never drawn as a surface: under each piece a soft contact shadow, so the paper
   sits in the room instead of floating on the page. */
export function createGround(stations: readonly Triple[], tier: QualityTier): Ground {
  const falloff = radial();
  const contact = new MeshBasicMaterial({
    map: falloff,
    color: new Color(0, 0, 0),
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const root = new Group();
  const contacts = stations.map(([x, , z]) => disc(contact, 2.6, [x, -0.01, z]));
  const meshes = contacts;
  root.add(...meshes);
  const catcher =
    tier === "full"
      ? new Mesh(new PlaneGeometry(9, 9), new ShadowMaterial({ opacity: 0.2, depthWrite: false }))
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
      contact.dispose();
      falloff.dispose();
    },
  };
}

export interface StudioLights {
  key: DirectionalLight;
  rim: DirectionalLight;
  fill: HemisphereLight;
}

/* A bright studio: a warm key that grazes the paper so every facet takes its own value, a cool rim that cuts
   the edges and shines through the thin paper, a soft fill from the white room. The key casts soft shadows on
   the full tier only; a contact shadow anchors every piece on both tiers. */
export function createLights(tier: QualityTier): StudioLights {
  const key = new DirectionalLight(new Color(1, 0.9, 0.78), 2.1);
  const rim = new DirectionalLight(new Color(0.72, 0.8, 1), 1.5);
  const fill = new HemisphereLight(new Color(1, 0.99, 0.97), new Color(0.62, 0.58, 0.52), 0.75);
  if (tier === "full") {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -3,
      right: 3,
      top: 3,
      bottom: -3,
      near: 0.5,
      far: 14,
    });
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 4;
  }
  return { key, rim, fill };
}
