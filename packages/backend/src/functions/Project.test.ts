import "mocha";
import { assert } from "chai";
import Project from "./Project";
import MockSocketUnTyped from "socket.io-mock";
import File from "./File";
import RGA from "rga/dist/RGA";

const prototypes = {};

describe("Project", function() {
  describe("Buffer API", function() {
    this.beforeEach(() => {
      prototypes["File.join"] = File.prototype.join;
      File.prototype.join = (): boolean => {
        return true;
      };
      prototypes["File.leave"] = File.prototype.leave;
      File.prototype.leave = (): void => {};
      prototypes["File.initialize"] = File.prototype.initialize;
      File.prototype.initialize = async (): Promise<void> => {
        return;
      };
    });

    it("should allow a client to join a project", () => {
      const projectPath = "dummy/path";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      const firstJoin = project.join(socket);
      assert.isTrue(firstJoin);
    });

    it("should allow a client to join a buffer", (done: MochaDone) => {
      const projectPath = "dummy/path";
      const filePath = "dummyFile.txt";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      project.join(socket);

      socket.socketClient.on(
        "open-buffer",
        (data: { path: string; content: RGA }) => {
          assert.equal(data.path, filePath);
          done();
        }
      );

      socket.socketClient.emit("join-buffer", { path: filePath });
    });

    it("should allow a client to leave a buffer", (done: MochaDone) => {
      File.prototype.leave = (): void => {
        assert(true);
        done();
      };

      const projectPath = "dummy/path";
      const filePath = "dummyFile.txt";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      project.join(socket);

      socket.socketClient.emit("join-buffer", { path: filePath });
      socket.socketClient.emit("leave-buffer", { path: filePath });
    });

    it("shouldn't allow a client to join a project twice", () => {
      const projectPath = "dummy/path";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      const firstJoin = project.join(socket);
      const secondJoin = project.join(socket);
      assert.isTrue(firstJoin);
      assert.isFalse(secondJoin);
    });

    this.afterEach(() => {
      File.prototype.join = prototypes["File.join"];
      File.prototype.leave = prototypes["File.leave"];
      File.prototype.initialize = prototypes["File.initialize"];
    });
  });
});
