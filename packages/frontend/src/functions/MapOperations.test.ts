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
        expect(op).toEqual({type: Operation.Insert, position: 0, character: "a"});
    });

    it("should insert another character at position 0", () => {
        const monacoOp = {range: range(1, 1, 1, 1),
                          rangeLength: 0,
                          text: "b",
                          rangeOffset: 0,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 0, character: "b"});
    });

    it("should insert a character at position 1", () => {
        const monacoOp = {range: range(1, 2, 1, 2),
                          rangeLength: 0,
                          text: "c",
                          rangeOffset: 1,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 1, character: "c"});
    });

    it("should insert a newline (LF)", () => {
        // TODO: create test for CRLF
        const monacoOp = {range: range(1, 1, 1, 1),
                          rangeLength: 0,
                          text: "\n",
                          rangeOffset: 0,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 0, character: "\n"});
    });

    it("should insert a newline (CR)", () => {
        const monacoOp = {range: range(1, 1, 1, 1),
                          rangeLength: 0,
                          text: "\r",
                          rangeOffset: 0,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 0, character: "\r"});
    });

    it("should insert a tab character", () => {
        const monacoOp = {range: range(1, 1, 1, 1),
                          rangeLength: 0,
                          text: "\t",
                          rangeOffset: 0,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 0, character: "\t"});
    });

    it("should insert a space", () => {
        const monacoOp = {range: range(5, 1, 5, 1),
                          rangeLength: 0,
                          text: " ",
                          rangeOffset: 8,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 8, character: " "});
    });

    it("should insert a character at line 2, column 1", () => {
        const monacoOp = {range: range(2, 1, 2, 1),
                          rangeLength: 0,
                          text: "d",
                          rangeOffset: 2,
                          forceMoveMarkers: false};

        const ops = mapOperations(monacoOp);

        expect(ops.length).toBe(1)
        const op = ops[0];
        expect(op).toEqual({type: Operation.Insert, position: 2, character: "d"});
    });

});