export interface CursorMovement {
  path: string;
  // The important info from RGAIdentifier
  id: { sid: number; sum: number };
}

export interface CursorInfo extends CursorMovement {
  name: string;
  socketId: string;
}

export type CursorList = CursorInfo[];
