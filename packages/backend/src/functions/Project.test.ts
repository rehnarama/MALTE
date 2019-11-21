import "mocha";
import { assert } from "chai";
import Project from "./Project";
import MockSocketUnTyped from "socket.io-mock";
import { Socket } from "socket.io";
import File from "./File";
import RGA from "rga/dist/RGA";

describe("Project", function() {
  describe("Buffer API", function() {
    this.beforeEach(() => {
      File.prototype.join = (socket: Socket): boolean => {
        return true;
      };
      File.prototype.leave = (socket: Socket): void => {};
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
      File.prototype.leave = (socket: Socket): void => {
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
  });
});
