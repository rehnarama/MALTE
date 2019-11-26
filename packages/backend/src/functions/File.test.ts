import "mocha";
import { assert } from "chai";
import MockSocketUnTyped from "socket.io-mock";
import fsMock from "mock-fs";
import File from "./File";
import fs from "fs";
import RGA from "rga/dist/RGA";
import RGAInsert from "rga/dist/RGAInsert";
import RGARemove from "rga/dist/RGARemove";

class MockSocket extends MockSocketUnTyped {
  public id: number;
  constructor() {
    super();
    this.id = Math.random() * Number.MAX_SAFE_INTEGER;
  }
}

describe("File", function() {
  this.beforeEach(() => {
    fsMock({
      "fake/dir/file.js": 'console.log("Hello World");'
    });
  });

  it("should initialize with existing file", async () => {
    const file = new File("fake/dir/file.js");
    await file.initialize();
    assert.equal(file["rga"].toString(), 'console.log("Hello World");');
  });

  it("should initialize with non-existing file", async () => {
    const file = new File("fake/dir/nope.js");
    await file.initialize();
    assert.equal(file["rga"].toString(), "");
    assert(fs.existsSync("fake/dir/nope.js"));
  });

  it("should allow a socket to join", async () => {
    const file = new File("fake/dir/file.js");
    await file.initialize();
    const socket = new MockSocketUnTyped();
    const success = file.join(socket);
    assert(success);
  });

  it("should send buffer-operation to others upon update", (done: MochaDone) => {
    const file = new File("fake/dir/file.js");
    file.initialize().then(() => {
      const sourceSocket: any = new MockSocket();
      const destinationSocket: any = new MockSocket();
      file.join(sourceSocket);
      file.join(destinationSocket);

      destinationSocket.socketClient.on(
        "buffer-operation",
        (data: { path: string; operation: RGAInsert | RGARemove }) => {
          const op = data.operation;
          assert(data.operation instanceof RGAInsert);
          if (op instanceof RGAInsert) {
            assert(op.content === "a");
          }
          done();
        }
      );

      const op = file["rga"].createInsertPos(0, "a");
      file.applyOperation(op, sourceSocket);
    });
  });

  this.afterEach(() => {
    fsMock.restore();
  });
});
