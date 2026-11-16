import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Line,
  type LineBasicMaterial,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  type Shape,
  Vector3,
} from "three";

import type { QualityTier } from "../lib/quality-tier.ts";
import {
  balanceShape,
  bridgeShape,
  plateShape,
  spiralPoints,
  wheelShape,
  type WheelSpec,
} from "./mecanique-geometry.ts";

export type Rgb = [red: number, green: number, blue: number];

/* Colours of the metals, resolved from the theme's brand tokens (0–255). */
export interface CalibrePalette {
  steel: Rgb;
  brass: Rgb;
  plate: Rgb;
  ruby: Rgb;
  dial: Rgb;
  ink: Rgb;
  blued: Rgb;
}

export type Finish = "steel" | "brass" | "plate" | "ruby" | "dial" | "ink" | "blued";

/* A piece of the movement: where it rests once assembled, where it floats in the exploded view, and its place
   in the assembly order. */
export interface CalibrePart {
  id: string;
  object: Group;
  home: Vector3;
  exploded: Vector3;
  order: number;
}

/* Detail per tier: curve segments and bevel steps change, the silhouette never does (the poster stays true). */
const DETAIL: Record<QualityTier, { curve: number; bevel: number }> = {
  light: { curve: 14, bevel: 1 },
  full: { curve: 20, bevel: 2 },
};

function rgb(color: Rgb): Color {
  return new Color().setRGB(color[0] / 255, color[1] / 255, color[2] / 255, "srgb");
}

function metal(color: Rgb, roughness: number): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({ color: rgb(color), metalness: 1, roughness });
}

export function createFinishes(palette: CalibrePalette): Record<Finish, MeshPhysicalMaterial> {
  return {
    steel: metal(palette.steel, 0.26),
    brass: metal(palette.brass, 0.32),
    blued: metal(palette.blued, 0.3),
    plate: new MeshPhysicalMaterial({
      color: rgb(palette.plate),
      metalness: 0.75,
      roughness: 0.42,
    }),
    ink: new MeshPhysicalMaterial({ color: rgb(palette.ink), metalness: 0.6, roughness: 0.35 }),
    dial: new MeshPhysicalMaterial({
      color: rgb(palette.dial),
      metalness: 0.05,
      roughness: 0.62,
      clearcoat: 0.4,
    }),
    ruby: new MeshPhysicalMaterial({
      color: rgb(palette.ruby),
      emissive: rgb(palette.ruby),
      emissiveIntensity: 0.35,
      metalness: 0,
      roughness: 0.08,
      clearcoat: 1,
    }),
  };
}

export interface PartBuilder {
  tier: QualityTier;
  finishes: Record<Finish, Material>;
  hairspring: LineBasicMaterial;
}

function slab(shape: Shape, depth: number, builder: PartBuilder): ExtrudeGeometry {
  const { curve, bevel } = DETAIL[builder.tier];
  return new ExtrudeGeometry(shape, {
    depth,
    curveSegments: curve,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: bevel,
  });
}

function mesh(geometry: BufferGeometry, material: Material): Mesh {
  return new Mesh(geometry, material);
}

function pinion(radius: number, builder: PartBuilder): Mesh {
  const geometry = new CylinderGeometry(radius, radius, 0.12, DETAIL[builder.tier].curve);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0, 0.02);
  return mesh(geometry, builder.finishes.steel);
}

export function wheel(spec: WheelSpec, finish: Finish, builder: PartBuilder): Group {
  const group = new Group();
  group.add(mesh(slab(wheelShape(spec), 0.035, builder), builder.finishes[finish]));
  group.add(pinion(spec.radius * 0.16, builder));
  return group;
}

export function plate(builder: PartBuilder): Group {
  const holes = [
    { x: -0.36, y: -0.32, radius: 0.3 },
    { x: 0.62, y: 0.58, radius: 0.05 },
    { x: -0.7, y: 0.62, radius: 0.04 },
  ];
  return new Group().add(mesh(slab(plateShape(1, holes), 0.08, builder), builder.finishes.plate));
}

export function bridge(from: [number, number], to: [number, number], builder: PartBuilder): Group {
  return new Group().add(
    mesh(slab(bridgeShape(from, to, 0.2), 0.045, builder), builder.finishes.steel),
  );
}

/* The balance and its blued hairspring: the part that beats. */
export function balance(builder: PartBuilder): Group {
  const group = new Group();
  group.add(mesh(slab(balanceShape(0.27, 0.045), 0.03, builder), builder.finishes.brass));
  const spiral = spiralPoints({ turns: 9, inner: 0.03, outer: 0.17, steps: 360 });
  const geometry = new BufferGeometry().setFromPoints(
    spiral.map(([x, y]) => new Vector3(x, y, 0.045)),
  );
  group.add(new Line(geometry, builder.hairspring), pinion(0.025, builder));
  return group;
}

export function screw(builder: PartBuilder): Group {
  const head = new CylinderGeometry(0.035, 0.035, 0.03, DETAIL[builder.tier].curve);
  head.rotateX(Math.PI / 2);
  const slot = new BoxGeometry(0.07, 0.012, 0.012).translate(0, 0, 0.015);
  return new Group().add(mesh(head, builder.finishes.blued), mesh(slot, builder.finishes.ink));
}

export function jewel(builder: PartBuilder): Group {
  const geometry = new CylinderGeometry(0.045, 0.05, 0.04, DETAIL[builder.tier].curve * 2);
  geometry.rotateX(Math.PI / 2);
  return new Group().add(mesh(geometry, builder.finishes.ruby));
}
