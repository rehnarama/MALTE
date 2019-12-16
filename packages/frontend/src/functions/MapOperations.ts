import { editor } from "monaco-editor";
import { Operation, InternalOperation } from "malte-common/dist/Operations";

function isRemoveOperation(op: editor.IModelContentChange): boolean {
  return op.rangeLength > 0 && op.text === "";
}

function isReplaceOperation(op: editor.IModelContentChange): boolean {
  return op.rangeLength > 0 && op.text !== "";
}

function mapRemoveOperation(
  op: editor.IModelContentChange
): InternalOperation[] {
  const newOps: InternalOperation[] = [];
  for (let i = op.rangeLength - 1; i >= 0; i--) {
    newOps.push({ type: Operation.Remove, position: op.rangeOffset + i });
  }
  return newOps;
}

function mapInsertOperation(
  op: editor.IModelContentChange
): InternalOperation[] {
  const text = op.text;
  if (text === "") {
    return [];
  }
  const newOps: InternalOperation[] = [
    {
      type: Operation.Insert,
      position: op.rangeOffset,
      character: text
    }
  ];
  return newOps;
}

function mapReplaceOperation(
  op: editor.IModelContentChange
): InternalOperation[] {
  const removeOps = mapRemoveOperation(op);
  const insertOps = mapInsertOperation(op);
  return removeOps.concat(insertOps);
}

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
function mapOperations(op: editor.IModelContentChange): InternalOperation[] {
  if (isRemoveOperation(op)) {
    return mapRemoveOperation(op);
  } else if (isReplaceOperation(op)) {
    return mapReplaceOperation(op);
  } else {
    return mapInsertOperation(op);
  }
}

export default mapOperations;

export function printInternalOperations(ops: InternalOperation[]): void {
  for (const op of ops) {
    if (op.type === Operation.Insert) {
      console.log("Insert '" + op.character + "' at position " + op.position);
    } else {
      console.log("Remove at position " + op.position);
    }
  }
}
