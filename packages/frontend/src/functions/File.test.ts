import { socket, cleanup, serverSocket } from "./testutils/MockSocket";

jest.mock("socket.io-client");
import io from "socket.io-client";
import {
  MockModel,
  mockEditorNamespace,
  mockMonacoNamespace
} from "./testutils/MockMonaco";
import File from "./File";
import RGA from "rga/dist/RGA";
import RGAInsert from "rga/dist/RGAInsert";
import RGARemove from "rga/dist/RGARemove";
import monaco, { editor as editorType } from "monaco-editor";

import Monaco from "./Monaco";
Monaco.getInstance = () => {
  const m = new Monaco();
  m["editor"] = (mockEditorNamespace as unknown) as typeof editorType;
  m["monaco"] = (mockMonacoNamespace as unknown) as typeof monaco;
  return m;
};

const ioMock = (io as unknown) as jest.Mock<SocketIOClient.Socket>;
ioMock.mockImplementation((...args) => {
  return socket;
});

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

  it("should create a socket listener for buffer-operation", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    expect(socket.hasListeners("buffer-operation")).toBeTruthy();
  });

  it("should apply an insert buffer-operation", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createInsertPos(0, "a");
    serverSocket.emit("buffer-operation", {
      path: "dummy/path.js",
      operation: op
    });

    expect(m1.value).toBe("a");
  });

  it("should apply a remove buffer-operation", () => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    const op = rga.createRemovePos(0);
    serverSocket.emit("buffer-operation", {
      path: "dummy/path.js",
      operation: op
    });

    expect(m1.value).toBe("");
  });

  it("should send buffer-operation on content change", done => {
    const m1 = new MockModel("");
    const rga = new RGA();
    rga.insert(rga.createInsertPos(0, "a"));
    new File(
      "dummy/path.js",
      rga.toRGAJSON(),
      (m1 as unknown) as editorType.ITextModel
    );

    serverSocket.on(
      "buffer-operation",
      (data: { path: string; operation: RGAInsert | RGARemove }) => {
        expect(data.path).toBe("dummy/path.js");
        expect(data.operation).toHaveProperty("content");
        if (data.operation instanceof RGAInsert) {
          expect(data.operation.content).toBe("b");
          done();
        }
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
      "buffer-operation",
      (data: { path: string; operation: RGAInsert | RGARemove }) => {
        expect(data).toBeUndefined();
      }
    );

    const op = rga.createInsertPos(0, "a");
    serverSocket.emit("buffer-operation", {
      path: "dummy/path.js",
      operation: op
    });
  });
});
