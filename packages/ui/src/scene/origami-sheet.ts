import type { Color, LineBasicMaterial, Material } from "three";

import {
  type CreasePattern,
  createCreasePattern,
  disposeCreasePattern,
} from "./origami-creases.ts";
import { sheetCreases, sheetPattern } from "./origami-patterns-ground.ts";
import { createPiece, disposePiece, type Piece } from "./origami-piece.ts";

export interface Sheet {
  piece: Piece;
  pattern: CreasePattern;
}

/* The square sheet the story starts from, its crease pattern drawn on it, ready to be traced, then folded. */
export function createSheet(paper: Material, creases: LineBasicMaterial, ink: Color): Sheet {
  const piece = createPiece(sheetPattern, paper, creases);
  const pattern = createCreasePattern(sheetCreases, ink);
  piece.root.children[0]?.add(pattern.root);
  return { piece, pattern };
}

export function disposeSheet(sheet: Sheet): void {
  disposePiece(sheet.piece);
  disposeCreasePattern(sheet.pattern);
}
