import mapOperations, { Range, Operation, InsertOperation } from "./MapOperations";

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

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op.type).toBe(Operation.Insert);
        const opTyped  = op as InsertOperation;
        expect(opTyped.position).toBe(0);
        expect(opTyped.character).toEqual("a");
    });

});