import { socket, cleanup, serverSocket } from "./testutils/MockSocket";

import { MockModel, mockMonacoNamespace } from "./testutils/MockMonaco";
import File from "./File";
import RGA from "rga/dist/RGA";
import RGAInsert from "rga/dist/RGAInsert";
import RGARemove from "rga/dist/RGARemove";
import { editor as editorType } from "monaco-editor";

describe("File", function() {
  afterEach(() => {
    cleanup();
  });

  it("should change model content to RGA content on constructor", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    expect(m1.value).toBe("a");
  });

  it("should create a socket listener for buffer/operation", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    expect(socket.hasListeners("buffer/operation")).toBeTruthy();
  });

  it("should apply an insert buffer/operation", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createInsertPos(0, "a");
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });

    expect(m1.value).toBe("a");
  });

  it("should apply a remove buffer/operation", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createRemovePos(0);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });

    expect(m1.value).toBe("");
  });

  it("should send buffer/operation on content change", done => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    serverSocket.on(
      "buffer/operation",
      (data: { path: string; operations: Array<RGAInsert | RGARemove> }) => {
        expect(data.path).toBe("dummy/path.js");
        data.operations.forEach(op => {
          expect(op).toHaveProperty("content");
          if (op instanceof RGAInsert) {
            expect(op.content).toBe("b");
            done();
          }
        });
      }
    );

    m1.appendCharacter("b");
  });

  it("should not send back change that came from server", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    serverSocket.on(
      "buffer/operation",
      (data: { path: string; operations: Array<RGAInsert | RGARemove> }) => {
        expect(data).toBeUndefined();
      }
    );

    const op = rga.createInsertPos(0, "a");
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });
  });

  it("should apply changes in the middle of a document", done => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    rga.insert(rga.createInsertPos(1, "b"));
    rga.insert(rga.createInsertPos(2, "c"));
    rga.insert(rga.createInsertPos(3, "d"));
    rga.insert(rga.createInsertPos(4, "\n"));
    rga.insert(rga.createInsertPos(5, "e"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    serverSocket.on(
      "buffer/operation",
      (data: { path: string; operations: Array<RGAInsert | RGARemove> }) => {
        expect(data.path).toBe("dummy/path.js");
        data.operations.forEach(op => {
          expect(op).toHaveProperty("content");
          if (op instanceof RGAInsert) {
            expect(op.content).toBe("x");
            done();
          }
        });
      }
    );

    const position = m1.getPositionAt(3);
    const range = mockMonacoNamespace.Range.fromPositions(position);
    const edit = ({
      range: range,
      text: "x",
      forceMoveMarkers: true
    } as unknown) as editorType.IIdentifiedSingleEditOperation;
    m1.applyEdits([edit]);
    expect(m1.value).toBe("abcxd\ne");
  });

  it("should insert block-wise edits", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createInsertPos(0, "abc");
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });

    expect(m1.value).toBe("abc");
  });

  it("should split block-wise chunks multiple times", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "abc"));
    const file = new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op1 = rga.createInsertPos(1, "!");
    rga.insert(op1);
    const op2 = rga.createInsertPos(3, "@");
    rga.insert(op2);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op1, op2]
    });

    expect(file.toString()).toBe("a!b@c");
    expect(m1.value).toBe("a!b@c");
  });

  it("should converge on concurrent insertions into block", () => {
    const m1 = new MockModel("");
    const rga1 = new RGA();
    rga1.insert(rga1.createInsertPos(0, "abc"));
    const rga2 = RGA.fromRGAJSON(rga1.toRGAJSON());

    const file1 = new File(
      "dummy/path.js",
      rga1.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op1 = rga1.createInsertPos(1, "!");
    const op2 = rga2.createInsertPos(2, "@");
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op1, op2]
    });

    expect(file1.toString()).toBe("a!b@c");
    expect(m1.value).toBe("a!b@c");
  });

  it("should converge on concurrent insertions into block, other order", () => {
    const m1 = new MockModel("");
    const rga1 = new RGA();
    rga1.insert(rga1.createInsertPos(0, "abc"));
    const rga2 = RGA.fromRGAJSON(rga1.toRGAJSON());

    const file1 = new File(
      "dummy/path.js",
      rga1.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op1 = rga1.createInsertPos(1, "!");
    const op2 = rga2.createInsertPos(2, "@");
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op2, op1]
    });

    expect(file1.toString()).toBe("a!b@c");
    expect(m1.value).toBe("a!b@c");
  });

  it("should be able to remove a letter from the start of a block", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "abc"));
    const file = new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createRemovePos(0);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });

    expect(file.toString()).toBe("bc");
    expect(m1.value).toBe("bc");
  });

  it("should be able to remove a letter from the middle of a block", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "abc"));
    const file = new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createRemovePos(1);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });

    expect(file.toString()).toBe("ac");
    expect(m1.value).toBe("ac");
  });

  it("should be able to remove a letter from the end of a block", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "abc"));
    const file = new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createRemovePos(2);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op]
    });

    expect(file.toString()).toBe("ab");
    expect(m1.value).toBe("ab");
  });

  it("should be able to remove a letter an already split block", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "abc"));
    const file = new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op1 = rga.createInsertPos(1, "!");
    rga.insert(op1);
    const op2 = rga.createInsertPos(3, "@");
    rga.insert(op2);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op1, op2]
    });

    // Now we should have a!b@c

    const op3 = rga.createRemovePos(2);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op3]
    });

    expect(file.toString()).toBe("a!@c");
    expect(m1.value).toBe("a!@c");
  });

  it("should conevrge on concurrent deletions to a block", () => {
    const m1 = new MockModel("");
    const rga1 = new RGA();
    rga1.insert(rga1.createInsertPos(0, "abc"));
    const rga2 = RGA.fromRGAJSON(rga1.toRGAJSON());

    const file1 = new File(
      "dummy/path.js",
      rga1.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op1 = rga1.createRemovePos(0);
    const op2 = rga2.createRemovePos(2);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op1, op2]
    });

    expect(file1.toString()).toBe("b");
    expect(m1.value).toBe("b");
  });

  it("should conevrge on concurrent deletions to a block, other order", () => {
    const m1 = new MockModel("");
    const rga1 = new RGA();
    rga1.insert(rga1.createInsertPos(0, "abc"));
    const rga2 = RGA.fromRGAJSON(rga1.toRGAJSON());

    const file1 = new File(
      "dummy/path.js",
      rga1.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op1 = rga1.createRemovePos(0);
    const op2 = rga2.createRemovePos(2);
    serverSocket.emit("buffer/operation", {
      path: "dummy/path.js",
      operations: [op2, op1]
    });

    expect(file1.toString()).toBe("b");
    expect(m1.value).toBe("b");
  });

  describe("Upstream insert block-wise", function() {
    it("should send single operation for a block of text", done => {
      const m1 = new MockModel("");
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, "a"));
      new File(
        "dummy/path.js",
        rga.toRGAJSON(),
        (m1 as unknown) as editorType.ITextModel
      );

      serverSocket.on(
        "buffer/operation",
        (data: { path: string; operations: Array<RGAInsert | RGARemove> }) => {
          expect(data.path).toBe("dummy/path.js");
          expect(data.operations.length === 1);
          const op = data.operations[0];
          expect(op).toHaveProperty("content");
          if (op instanceof RGAInsert) {
            expect(op.content).toBe("xyz");
            done();
          }
        }
      );

      const position = m1.getPositionAt(1);
      const range = mockMonacoNamespace.Range.fromPositions(position);
      const edit = ({
        range: range,
        text: "xyz",
        forceMoveMarkers: true
      } as unknown) as editorType.IIdentifiedSingleEditOperation;
      m1.applyEdits([edit]);
      expect(m1.value).toBe("axyz");
    });

    it("should send multiple operations with one package", done => {
      const m1 = new MockModel("");
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, "abcde"));
      new File(
        "dummy/path.js",
        rga.toRGAJSON(),
        (m1 as unknown) as editorType.ITextModel
      );

      serverSocket.on(
        "buffer/operation",
        (data: { path: string; operations: Array<RGAInsert | RGARemove> }) => {
          expect(data.path).toBe("dummy/path.js");
          expect(data.operations.length === 2);

          const op1 = data.operations[0];
          expect(op1).toHaveProperty("content");
          if (op1 instanceof RGAInsert) {
            expect(op1.content).toBe("!");
          }

          const op2 = data.operations[1];
          expect(op2).toHaveProperty("content");
          if (op2 instanceof RGAInsert) {
            expect(op2.content).toBe("#");
            done();
          }
        }
      );

      const position1 = m1.getPositionAt(3);
      const range1 = mockMonacoNamespace.Range.fromPositions(position1);
      const edit1 = ({
        range: range1,
        text: "!",
        forceMoveMarkers: true
      } as unknown) as editorType.IIdentifiedSingleEditOperation;
      const position2 = m1.getPositionAt(5);
      const range2 = mockMonacoNamespace.Range.fromPositions(position2);
      const edit2 = ({
        range: range2,
        text: "#",
        forceMoveMarkers: true
      } as unknown) as editorType.IIdentifiedSingleEditOperation;
      m1.applyEdits([edit1, edit2]);
      expect(m1.value).toBe("abc!d#e");
    });
  });
});
