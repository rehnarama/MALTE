export interface CursorMovement {
  path: string;
  // The important info from RGAIdentifier
  id: { sid: number; sum: number };
}

export interface CursorInfo extends CursorMovement {
  userId: string;
}

export type CursorList = CursorInfo[];
