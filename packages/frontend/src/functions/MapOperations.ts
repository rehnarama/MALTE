
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

function mapOperations(op: MonacoOperation): InternalOperation[] {
    let newOps: InternalOperation[] = [];
    if (op.rangeLength > 0) {
        for (let i = op.rangeLength - 1; i >= 0; i--) {
            newOps.push({type: Operation.Remove, position: op.rangeOffset + i});
        }
        return newOps;
    } else {
        for (let i = 0; i < op.text.length; i++) {
            newOps.push({type: Operation.Insert, position: op.rangeOffset + i, character: op.text.charAt(i)})
        }
        return newOps;
    }
}

export default mapOperations;