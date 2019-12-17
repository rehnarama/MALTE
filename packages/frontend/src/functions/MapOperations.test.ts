import mapOperations from "./MapOperations";
import { Operation } from "malte-common/dist/Operations";
import { IRange } from "monaco-editor";

function range(
  startLineNumber: number,
  startColumn: number,
  endLineNumber: number,
  endColumn: number
): IRange {
  return { startColumn, startLineNumber, endColumn, endLineNumber };
}

describe("MapOperations", function() {
  describe("Single character insertion", function() {
    it("should insert at position 0", () => {
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "a",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "a"
      });
    });

    it("should insert another character at position 0", () => {
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "b",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "b"
      });
    });

    it("should insert a character at position 1", () => {
      const monacoOp = {
        range: range(1, 2, 1, 2),
        rangeLength: 0,
        text: "c",
        rangeOffset: 1,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 1,
        character: "c"
      });
    });

    it("should insert a newline (LF)", () => {
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "\n",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "\n"
      });
    });

    it("should insert a tab character", () => {
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "\t",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "\t"
      });
    });

    it("should insert a space", () => {
      const monacoOp = {
        range: range(5, 1, 5, 1),
        rangeLength: 0,
        text: " ",
        rangeOffset: 8,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 8,
        character: " "
      });
    });

    it("should insert a character at line 2, column 1", () => {
      const monacoOp = {
        range: range(2, 1, 2, 1),
        rangeLength: 0,
        text: "d",
        rangeOffset: 2,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({
        type: Operation.Insert,
        position: 2,
        character: "d"
      });
    });

    it("shouldn't insert from empty string without delete", () => {
      // This case can occur when changing the EOL to LineFeed
      // on an empty model using model.pushEOL().
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(0);
    });
  });

  describe("Single character deletion", function() {
    it("should delete the first character", () => {
      const monacoOp = {
        range: range(1, 1, 1, 2),
        rangeLength: 1,
        text: "",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({ type: Operation.Remove, position: 0 });
    });

    it("should delete a character on line 2", () => {
      const monacoOp = {
        range: range(2, 4, 2, 5),
        rangeLength: 1,
        text: "",
        rangeOffset: 8,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({ type: Operation.Remove, position: 8 });
    });

    it("should delete a newline", () => {
      const monacoOp = {
        range: range(2, 11, 3, 1),
        rangeLength: 1,
        text: "",
        rangeOffset: 17,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      const op = ops[0];
      expect(op).toEqual({ type: Operation.Remove, position: 17 });
    });
  });

  describe("Multiple character deletion", function() {
    it("should delete two first characters", () => {
      const monacoOp = {
        range: range(1, 1, 1, 3),
        rangeLength: 2,
        text: "",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(2);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 1 });
      expect(ops[1]).toEqual({ type: Operation.Remove, position: 0 });
    });

    it("should delete first three second line characters", () => {
      const monacoOp = {
        range: range(2, 1, 2, 4),
        rangeLength: 3,
        text: "",
        rangeOffset: 3,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(3);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 5 });
      expect(ops[1]).toEqual({ type: Operation.Remove, position: 4 });
      expect(ops[2]).toEqual({ type: Operation.Remove, position: 3 });
    });

    it("should delete multiple lines", () => {
      const monacoOp = {
        range: range(2, 10, 3, 2),
        rangeLength: 4,
        text: "",
        rangeOffset: 16,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(4);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 19 });
      expect(ops[1]).toEqual({ type: Operation.Remove, position: 18 });
      expect(ops[2]).toEqual({ type: Operation.Remove, position: 17 });
      expect(ops[3]).toEqual({ type: Operation.Remove, position: 16 });
    });
  });

  describe("Multiple character insertion", function() {
    it("should insert two character pasted first in document", () => {
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "ab",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      expect(ops[0]).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "ab"
      });
    });

    it("should insert five character pasted in the middle of a line", () => {
      const monacoOp = {
        range: range(2, 4, 2, 4),
        rangeLength: 0,
        text: "abcde",
        rangeOffset: 8,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      expect(ops[0]).toEqual({
        type: Operation.Insert,
        position: 8,
        character: "abcde"
      });
    });

    it("should insert pasted text including a new line", () => {
      const monacoOp = {
        range: range(1, 1, 1, 1),
        rangeLength: 0,
        text: "ab\nde",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(1);
      expect(ops[0]).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "ab\nde"
      });
    });

    it("should insert autocomplete from 'a' to 'alert'", () => {
      const monacoOp = {
        range: range(1, 1, 1, 2),
        rangeLength: 1, // Length of previously inserted part of autocomplete
        text: "alert",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(2);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 0 });
      expect(ops[1]).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "alert"
      });
    });

    it("should insert autocomplete from 'al' to 'alert'", () => {
      const monacoOp = {
        range: range(1, 1, 1, 3),
        rangeLength: 2,
        text: "alert",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(3);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 1 });
      expect(ops[1]).toEqual({ type: Operation.Remove, position: 0 });
      expect(ops[2]).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "alert"
      });
    });

    it("should insert autocomplete from 'fr' to 'for'", () => {
      const monacoOp = {
        range: range(1, 1, 1, 3),
        rangeLength: 2,
        text: "for",
        rangeOffset: 0,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(3);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 1 });
      expect(ops[1]).toEqual({ type: Operation.Remove, position: 0 });
      expect(ops[2]).toEqual({
        type: Operation.Insert,
        position: 0,
        character: "for"
      });
    });

    it("should insert autocomplete mid line from 'ipo' to 'import'", () => {
      const monacoOp = {
        range: range(2, 5, 2, 8),
        rangeLength: 3,
        text: "import",
        rangeOffset: 11,
        forceMoveMarkers: false
      };

      const ops = mapOperations(monacoOp);

      expect(ops.length).toBe(4);
      expect(ops[0]).toEqual({ type: Operation.Remove, position: 13 });
      expect(ops[1]).toEqual({ type: Operation.Remove, position: 12 });
      expect(ops[2]).toEqual({ type: Operation.Remove, position: 11 });
      expect(ops[3]).toEqual({
        type: Operation.Insert,
        position: 11,
        character: "import"
      });
    });
  });
});
