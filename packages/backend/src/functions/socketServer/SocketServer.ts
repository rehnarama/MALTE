import socketio from "socket.io";
import http from "http";
import { Terminal } from "../terminal";
import { FileSystem } from "../filesystem";
import Project from "../Project";
import fsTree from "../fsTree";
import GitHub from "../oauth/GitHub";
import { User as GitHubUser } from "malte-common/dist/oauth/GitHub";
import { isUser } from "malte-common/dist/oauth/isUser";

export default class SocketServer {
  private static instance: SocketServer;

  private project: Project;
  public server: SocketIO.Server;

  private userMap = new Map<string, GitHubUser>();

  private constructor(
    server: http.Server,
    frontendUrl: string,
    project: Project
  ) {
    this.server = socketio(server, { origins: frontendUrl });
    this.project = project;

    this.server.on("connection", this.onConnection.bind(this));
  }

  private onConnection(socket: SocketIO.Socket): void {
    console.log(`Socket with id ${socket.id} connected`);

    // everyone must be able to request to join, otherwise noone can join
    socket.on("join-group", async userId => {
      const response = await GitHub.getInstance().getUser(userId);

      if (this.userMap.has(socket.id)) {
        // Already authenticated, let's not join this one again
        return;
      }

      if (isUser(response)) {
        this.userMap.set(socket.id, response);

        // Tell user they are authenticated
        socket.emit("authenticated");

        this.project.join(socket);
        new Terminal(socket, this.project.getPath());
        new FileSystem(socket, this.project.getPath());

        socket.on("refresh-file-tree", async () => {
          // send file tree on request from client
          socket.emit("file-tree", await fsTree(this.project.getPath()));
        });

        socket.join("authenticated");
        // emit filetree here can be removed later when we have login in separate window
        socket.emit("file-tree", await fsTree(this.project.getPath()));
      }
    });

    socket.on("disconnect", () => {
      this.userMap.delete(socket.id);
    });
  }

  public getUser(socketId: string): GitHubUser | undefined {
    return this.userMap.get(socketId);
  }

  public static initialize(
    server: http.Server,
    frontendUrl: string,
    project: Project
  ): SocketServer {
    this.instance = new SocketServer(server, frontendUrl, project);
    return this.instance;
  }

  public static getInstance(): SocketServer {
    if (this.instance) {
      return this.instance;
    } else {
      throw new Error("Must call initialize first");
    }
  }
}
