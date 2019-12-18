export interface CursorMovement {
  path: string;
  // The important info from RGAIdentifier
  id: { sid: number; sum: number };
  offset: number;
}

export interface CursorInfo extends CursorMovement {
  login: string;
  socketId: string;
}

export type CursorList = CursorInfo[];
