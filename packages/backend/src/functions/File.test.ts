import "mocha";
import { assert } from "chai";
import MockSocketUnTyped from "socket.io-mock";
import fsMock from "mock-fs";
import File from "./File";
import fs from "fs";
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
  describe("Initialization and socket", function() {
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

    it("should send buffer/operation to others upon update", (done: MochaDone) => {
      const file = new File("fake/dir/file.js");
      file.initialize().then(() => {
        const sourceSocket: any = new MockSocket();
        const destinationSocket: any = new MockSocket();
        file.join(sourceSocket);
        file.join(destinationSocket);

        destinationSocket.socketClient.on(
          "buffer/operation",
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

  describe("::scheduleSave()", () => {
    let saveProt: typeof File.prototype["save"];
    beforeEach(() => {
      saveProt = File.prototype["save"];
    });
    afterEach(() => {
      File.prototype["save"] = saveProt;
    });

    it("Should save when no save has happened before", () => {
      let saveCount = 0;
      File.prototype["save"] = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename");
      f.scheduleSave();

      assert.equal(saveCount, 1);
    });

    it("Should only save once if triggering save twice short after each other", () => {
      let saveCount = 0;
      File.prototype["save"] = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename");
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);
    });

    async function wait(ms: number): Promise<void> {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }

    it("Should save twice if triggering close to each other after a short while", async function() {
      let saveCount = 0;
      File.prototype["save"] = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename", 5);
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);

      while (f.isSaveScheduled()) {
        await wait(2);
      }

      assert.equal(saveCount, 2);
    });

    it("Should only save twice if triggering many times close to each other", async () => {
      let saveCount = 0;
      File.prototype["save"] = async (): Promise<void> => {
        saveCount++;
      };

      const f = new File("filename", 5);
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();
      f.scheduleSave();

      assert.equal(saveCount, 1);

      while (f.isSaveScheduled()) {
        await wait(2);
      }

      assert.equal(saveCount, 2);
    });
  });
});
