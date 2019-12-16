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

  it("downstream remove", () => {
    expect(true);
  });

  it("upstream insert", () => {
    expect(true);
  });

  it("upstream remove", () => {
    expect(true);
  });
});
