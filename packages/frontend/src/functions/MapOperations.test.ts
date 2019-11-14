import "mocha"
import {assert} from "chai";
import mapOperations, { Range, Operation } from "./MapOperations";

function range(startLineNumber: number, startColumn: number, 
               endLineNumber: number, endColumn: number): Range {
    return {startColumn, startLineNumber, endColumn, endLineNumber};
}

describe("MapOperations", function() {
    it("should insert at position 0", () => {
        const monacoOp = {range: range(1, 1, 1, 1),
                          rangeLength: 0,
                          text: "a",
                          rangeOffset: 0,
                          forceMoveMarkers: false};
        const ops = mapOperations(monacoOp);
        assert(ops.length === 1);
        const op = ops[0];
        assert(op.type == Operation.Insert && op.position == 0 && op.character === "a");
    });

});