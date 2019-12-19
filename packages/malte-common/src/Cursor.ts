export interface CursorMovement {
  path: string;
  // The important info from RGAIdentifier
  from?: { sid: number; sum: number, offset: number };
  to: { sid: number; sum: number, offset: number };
}

export interface CursorInfo extends CursorMovement {
  login: string;
  socketId: string;
}

export type CursorList = CursorInfo[];
