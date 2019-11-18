
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

/**
 * Converts an operation from the Monaco Editor to Internal operations
 * 
 * Removals are done from right-to-left and insertions are done left-to-right.
 * Replacing characters, e.g. autocompletions, are converted to Remove operations
 * followed by Insert operations.
 * 
 * @param op the change operation aquired from 'onDidChangeContent' listener
 * @return   a list of internal operations that correspond to op
 */
function mapOperations(op: MonacoOperation): InternalOperation[] {
    if (isRemoveOperation(op)) {
        return mapRemoveOperation(op);
    } else if (isReplaceOperation(op)) {
        return mapReplaceOperation(op);
    } else {
        return mapInsertOperation(op);
    }
}

export default mapOperations;

function isRemoveOperation(op: MonacoOperation): boolean {
    return op.rangeLength > 0 && op.text === "";
}

function isReplaceOperation(op: MonacoOperation): boolean {
    return op.rangeLength > 0 && op.text !== ""; 
}

function mapRemoveOperation(op: MonacoOperation): InternalOperation[] {
    let newOps: InternalOperation[] = [];
    for (let i = op.rangeLength - 1; i >= 0; i--) {
        newOps.push({type: Operation.Remove, position: op.rangeOffset + i});
    }
    return newOps;
}

function mapInsertOperation(op: MonacoOperation): InternalOperation[] {
    let newOps: InternalOperation[] = [];
    for (let i = 0; i < op.text.length; i++) {
        newOps.push({ type: Operation.Insert, position: op.rangeOffset + i, character: op.text.charAt(i) });
    }
    return newOps;
}

function mapReplaceOperation(op: MonacoOperation): InternalOperation[] {
    const removeOps = mapRemoveOperation(op);
    const insertOps = mapInsertOperation(op);
    return removeOps.concat(insertOps);
}
