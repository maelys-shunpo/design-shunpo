import {
  BoxGeometry,
  BufferGeometry,
  RingGeometry,
  Group,
  LineBasicMaterial,
  Mesh,
  Vector3,
} from "three";

import type { QualityTier } from "../lib/quality-tier.ts";
import {
  balance,
  bridge,
  type CalibrePalette,
  type CalibrePart,
  createFinishes,
  type Finish,
  jewel,
  type PartBuilder,
  plate,
  screw,
  wheel,
} from "./mecanique-parts.ts";

/* The calibre: a watch movement built in code. Each part knows its home, its exploded place and its turn in the
   assembly; the moving parts keep a handle so `poseCalibre` can turn them. */

export interface Calibre {
  root: Group;
  parts: CalibrePart[];
  train: Array<{ object: Group; speed: number }>;
  escape: Group;
  balance: Group;
  dial: Group;
  hands: { hour: Group; minute: Group; second: Group };
  finishes: ReturnType<typeof createFinishes>;
  hairspring: LineBasicMaterial;
  /* Seconds the movement has run: it only advances once the movement is assembled. */
  running: number;
}

interface Placement {
  id: string;
  object: Group;
  at: [x: number, y: number, z: number];
  /* Height in the exploded view, along the axis the parts were lifted on. */
  lift: number;
}

const TRAIN = [
  { id: "barillet", teeth: 72, radius: 0.4, at: [-0.4, 0.34], speed: 0.05, finish: "brass" },
  { id: "centre", teeth: 64, radius: 0.3, at: [0.02, 0.04], speed: -0.18, finish: "brass" },
  { id: "moyenne", teeth: 56, radius: 0.22, at: [0.42, 0.26], speed: 0.5, finish: "brass" },
  { id: "seconde", teeth: 48, radius: 0.19, at: [0.4, -0.2], speed: -1.1, finish: "brass" },
] as const;

const ESCAPE_AT: [number, number] = [0.12, -0.46];
const BALANCE_AT: [number, number] = [-0.36, -0.32];
const BRIDGES: Array<{ id: string; from: [number, number]; to: [number, number]; lift: number }> = [
  { id: "pont-barillet", from: [-0.74, 0.42], to: [-0.12, 0.56], lift: 1.2 },
  { id: "pont-rouage", from: [0.14, 0.52], to: [0.62, -0.36], lift: 1.32 },
  { id: "coq", from: [-0.84, -0.08], to: BALANCE_AT, lift: 1.08 },
];

function trainPlacements(builder: PartBuilder, calibre: Pick<Calibre, "train">): Placement[] {
  return TRAIN.map((spec, index) => {
    const object = wheel(
      { teeth: spec.teeth, radius: spec.radius, toothDepth: 0.022, spokes: index === 0 ? 5 : 4 },
      spec.finish satisfies Finish,
      builder,
    );
    calibre.train.push({ object, speed: spec.speed });
    return { id: spec.id, object, at: [...spec.at, 0.1], lift: 0.3 + index * 0.16 };
  });
}

function screwPlacements(builder: PartBuilder): Placement[] {
  return BRIDGES.flatMap((bridgeSpec) =>
    [bridgeSpec.from, bridgeSpec.to]
      .filter((point) => point !== BALANCE_AT)
      .map((point, index) => ({
        id: `vis-${bridgeSpec.id}-${index}`,
        object: screw(builder),
        at: [point[0], point[1], 0.23] as [number, number, number],
        lift: 1.5,
      })),
  );
}

function toPart({ id, object, at, lift }: Placement, order: number): CalibrePart {
  const home = new Vector3(...at);
  const exploded = new Vector3(at[0] * 1.12, at[1] * 1.12, lift);
  object.position.copy(exploded);
  return { id, object, home, exploded, order };
}

function hand(length: number, width: number, material: Mesh["material"]): Group {
  const geometry = new BoxGeometry(width, length, 0.008).translate(0, length / 2 - 0.04, 0);
  return new Group().add(new Mesh(geometry, material));
}

function buildDial(calibre: Pick<Calibre, "finishes" | "hands" | "dial">): void {
  const { dial, finishes, hands } = calibre;
  /* An open-worked chapter ring: the running movement stays visible through the dial. */
  const ring = new RingGeometry(0.74, 1.02, 128, 1);
  dial.add(new Mesh(ring, finishes.dial));
  const track = new RingGeometry(0.955, 0.962, 128, 1).translate(0, 0, 0.004);
  dial.add(new Mesh(track, finishes.ink));
  for (let hour = 0; hour < 12; hour += 1) {
    const long = hour % 3 === 0;
    const index = new BoxGeometry(long ? 0.034 : 0.016, long ? 0.15 : 0.09, 0.012);
    const marker = new Mesh(index.translate(0, 0.86, 0.008), finishes.ink);
    marker.rotation.z = (-hour / 12) * Math.PI * 2;
    dial.add(marker);
  }
  for (const piece of [hands.hour, hands.minute, hands.second]) {
    piece.position.z = 0.03;
    dial.add(piece);
  }
}

export function createCalibre(tier: QualityTier, palette: CalibrePalette): Calibre {
  const finishes = createFinishes(palette);
  const hairspring = new LineBasicMaterial({ color: `rgb(${palette.blued.join(",")})` });
  const builder: PartBuilder = { tier, finishes, hairspring };
  const calibre: Calibre = {
    root: new Group(),
    parts: [],
    train: [],
    escape: wheel(
      { teeth: 15, radius: 0.12, toothDepth: 0.03, spokes: 4, profile: "club" },
      "steel",
      builder,
    ),
    balance: balance(builder),
    dial: new Group(),
    hands: {
      hour: hand(0.5, 0.04, finishes.ink),
      minute: hand(0.74, 0.028, finishes.ink),
      second: hand(0.86, 0.01, finishes.ruby),
    },
    finishes,
    hairspring,
    running: 0,
  };
  const placements: Placement[] = [
    { id: "platine", object: plate(builder), at: [0, 0, 0], lift: -0.45 },
    ...trainPlacements(builder, calibre),
    { id: "echappement", object: calibre.escape, at: [...ESCAPE_AT, 0.11], lift: 0.92 },
    { id: "balancier", object: calibre.balance, at: [...BALANCE_AT, 0.12], lift: 0.82 },
    ...BRIDGES.map((spec) => ({
      id: spec.id,
      object: bridge(spec.from, spec.to, builder),
      at: [0, 0, 0.17] as [number, number, number],
      lift: spec.lift,
    })),
    ...screwPlacements(builder),
    { id: "rubis", object: jewel(builder), at: [...BALANCE_AT, 0.235], lift: 1.62 },
  ];
  calibre.parts = placements.map((placement, order) => toPart(placement, order));
  buildDial(calibre);
  calibre.root.add(...calibre.parts.map((part) => part.object), calibre.dial);
  return calibre;
}

export function disposeCalibre(calibre: Calibre): void {
  calibre.root.traverse((object) => {
    const geometry: unknown = Reflect.get(object, "geometry");
    if (geometry instanceof BufferGeometry) {
      geometry.dispose();
    }
  });
  for (const material of Object.values(calibre.finishes)) {
    material.dispose();
  }
  calibre.hairspring.dispose();
}
