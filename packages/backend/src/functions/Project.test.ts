import "mocha";
import { assert } from "chai";
import Project from "./Project";
import MockSocketUnTyped from "socket.io-mock";
import File from "./File";
import { RGAJSON } from "rga/dist/RGA";
import SocketServer from "./socketServer/SocketServer";
import MockSocketIoServer from "./socketServer/MockSocketIoServer";
import MockSocketServer from "./socketServer/MockSocketServer";

const prototypes = {};

describe("Project", function() {
  describe("Buffer API", function() {
    this.beforeEach(() => {
      prototypes["File.join"] = File.prototype.join;
      File.prototype.join = (): boolean => {
        return true;
      };
      prototypes["File.leave"] = File.prototype.leave;
      File.prototype.leave = (): boolean => {
        return false;
      };
      prototypes["File.initialize"] = File.prototype.initialize;
      File.prototype.initialize = async (): Promise<void> => {
        return;
      };
      prototypes["File.getContent"] = File.prototype.getContent;
      File.prototype.getContent = (): RGAJSON => {
        return { nodes: [] };
      };
      prototypes["Project.closeFiles"] = Project.prototype["closeFiles"];

      SocketServer["instance"] = new MockSocketServer();
    });

    this.afterEach(() => {
      File.prototype.join = prototypes["File.join"];
      File.prototype.leave = prototypes["File.leave"];
      File.prototype.initialize = prototypes["File.initialize"];
      File.prototype.getContent = prototypes["File.getContent"];
      Project.prototype["closeFiles"] = prototypes["Project.closeFiles"];
      SocketServer["instance"] = undefined;
    });

    it("should allow a client to join a project", () => {
      const projectPath = "dummy/path";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      const firstJoin = project.join(socket);
      assert.isTrue(firstJoin);
    });

    // how to test if a client has joined the "authenticated" group
    it("should allow a client to join a buffer", (done: MochaDone) => {
      const projectPath = "dummy/path";
      const filePath = "dummyFile.txt";
      const project = new Project(projectPath);

      const server = SocketServer.getInstance() as MockSocketServer;
      const io = server.server as MockSocketIoServer;
      const socket = io.addMockSocket();

      socket.emit("connection/auth", "my user id");

      project.join(socket);

      socket.on("buffer/open", (data: { path: string; content: RGAJSON }) => {
        assert.equal(data.path, filePath);
        done();
      });

      socket.emit("buffer/join", { path: filePath });
    });

    it("should allow a client to leave a buffer", (done: MochaDone) => {
      File.prototype.leave = (): boolean => {
        assert(true);
        done();
        return false;
      };

      const projectPath = "dummy/path";
      const filePath = "dummyFile.txt";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      project.join(socket);

      socket.socketClient.emit("buffer/join", { path: filePath });
      socket.socketClient.emit("buffer/leave", { path: filePath });
    });

    it("should close a buffer on leave if no other client uses it", (done: MochaDone) => {
      File.prototype.leave = (): boolean => {
        return true;
      };
      File.prototype.close = async (): Promise<void> => {
        done();
        return;
      };

      const projectPath = "dummy/path";
      const filePath = "dummyFile.txt";
      const project = new Project(projectPath);
      const socket = new MockSocketUnTyped();
      project.join(socket);

      socket.socketClient.emit("buffer/join", { path: filePath });
      socket.socketClient.emit("buffer/leave", { path: filePath });
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
