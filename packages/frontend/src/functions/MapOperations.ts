
export interface Range {
    endColumn: number;
    endLineNumber: number;
    startColumn: number;
    startLineNumber: number;
}

export interface MonacoOperation {
    range: Range;
    rangeLength: number;
    rangeOffset: number;
    text: string;
}

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

function mapOperations(operation: MonacoOperation): InternalOperation[] {
    return [{type: Operation.Insert, position: 0, character: "a"}];
}

export default mapOperations;