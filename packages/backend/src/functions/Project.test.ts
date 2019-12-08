import "mocha";
import { assert } from "chai";
import Project from "./Project";
import MockSocketUnTyped from "socket.io-mock";
import File from "./File";
import { RGAJSON } from "rga/dist/RGA";
import SocketServer from "./socketServer/SocketServer";
import MockSocketIoServer from "./socketServer/MockSocketIoServer";
import MockSocketServer from "./socketServer/MockSocketServer";
import MockSocket from "./socketServer/MockSocket";

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
      prototypes["File.getContent"] = File.prototype.getContent;
      File.prototype.getContent = (): RGAJSON => {
        return { nodes: [] };
      };

      SocketServer["instance"] = new MockSocketServer();
    });

    this.afterEach(() => {
      File.prototype.join = prototypes["File.join"];
      File.prototype.leave = prototypes["File.leave"];
      File.prototype.initialize = prototypes["File.initialize"];
      File.prototype.getContent = prototypes["File.getContent"];
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

      socket.on("open-buffer", (data: { path: string; content: RGAJSON }) => {
        assert.equal(data.path, filePath);
        done();
      });

      socket.emit("join-buffer", { path: filePath });
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
  });
});
