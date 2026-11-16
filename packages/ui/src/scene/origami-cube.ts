import {
  CanvasTexture,
  Group,
  type LineBasicMaterial,
  Matrix4,
  type MeshStandardMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";

import { foldAmount, setFold } from "./origami-folds.ts";
import { unitPattern } from "./origami-patterns-ground.ts";
import { createPiece, disposePiece, type Piece } from "./origami-piece.ts";

/* The modules of an application, one per unit of the cube, in the order they arrive. */
export const MODULES = [
  "Authentification",
  "CRM",
  "Paiement",
  "Agent IA",
  "Tableau de bord",
  "Notifications",
] as const;

/* Each unit's face, outward, and the way its label reads: up the cube's side, or toward the back on the lids. */
interface Face {
  normal: readonly [number, number, number];
  up: readonly [number, number, number];
}

const FACES: readonly Face[] = [
  { normal: [0, 0, 1], up: [0, 1, 0] },
  { normal: [1, 0, 0], up: [0, 1, 0] },
  { normal: [0, 1, 0], up: [0, 0, -1] },
  { normal: [-1, 0, 0], up: [0, 1, 0] },
  { normal: [0, 0, -1], up: [0, 1, 0] },
  { normal: [0, -1, 0], up: [0, 0, 1] },
];

export interface Cube {
  root: Group;
  units: Piece[];
  rest: Quaternion[];
  labels: CanvasTexture[];
}

const LABEL = 512;

/* A module's name printed at the centre of its unit, where the body sits on the sheet. */
export function createLabel(name: string, index: number, font: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = LABEL;
  canvas.height = LABEL;
  const context = canvas.getContext("2d");
  if (context !== null) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, LABEL, LABEL);
    context.fillStyle = "#0e0e0c";
    context.textAlign = "center";
    context.font = `600 12px ${font}`;
    context.fillText(String(index + 1).padStart(2, "0"), LABEL / 2, LABEL / 2 - 26);
    context.font = `600 17px ${font}`;
    context.fillText(name, LABEL / 2, LABEL / 2 + 12);
  }
  return Object.assign(new CanvasTexture(canvas), { colorSpace: SRGBColorSpace, anisotropy: 4 });
}

function restOf(normal: Vector3, up: Vector3): Quaternion {
  const back = up.clone().negate();
  const side = new Vector3().crossVectors(normal, back);
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(side, normal, back));
}

/* Six units, each in its own paper with its module's label, waiting to lock into a cube. */
export function createCube(
  papers: readonly MeshStandardMaterial[],
  creases: LineBasicMaterial,
  labels: CanvasTexture[],
): Cube {
  const root = new Group();
  const units = papers.map((paper) => createPiece(unitPattern, paper, creases));
  const rest = FACES.map(({ normal, up }) => restOf(new Vector3(...normal), new Vector3(...up)));
  root.add(...units.map((unit) => unit.root));
  return { root, units, rest, labels };
}

export function disposeCube(cube: Cube): void {
  for (const unit of cube.units) {
    disposePiece(unit);
  }
  for (const label of cube.labels) {
    label.dispose();
  }
}

const SIDE = 1;
const spin = new Quaternion();
const axis = new Vector3(1, 0.4, 0).normalize();

/* The units arrive one after the other from beyond the cube, turning as they come, settle on their face and
   tuck their tabs into the neighbours' pockets. `assembly` runs from 0 (none arrived) to 1 (the cube closed). */
export function poseCube(cube: Cube, assembly: number, flutter: number): void {
  cube.units.forEach((unit, index) => {
    const arrival = foldAmount(assembly, [index * 0.12, index * 0.12 + 0.4]);
    const face = FACES[index];
    const rest = cube.rest[index];
    if (face === undefined || rest === undefined) {
      return;
    }
    const away = (1 - arrival) * 3.4;
    unit.root.position.set(...face.normal).multiplyScalar(SIDE / 2 + away);
    unit.root.position.setY(unit.root.position.y + (1 - arrival) * 1.4);
    spin.setFromAxisAngle(axis, (1 - arrival) * 2.6);
    unit.root.quaternion.copy(rest).premultiply(spin);
    Object.assign(unit.root, { visible: arrival > 0 });
    setFold(unit.facets, arrival, { flutter, rest: 0.05 });
  });
}
