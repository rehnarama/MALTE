export enum Operation {
  Insert,
  Remove
}

export interface RemoveOperation {
  type: Operation.Remove;
  position: number;
}

export interface InsertOperation {
  type: Operation.Insert;
  position: number;
  character: string;
}

export type InternalOperation = RemoveOperation | InsertOperation;

