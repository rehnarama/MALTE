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
  protected static instance: SocketServer;

  protected project: Project;
  public server: SocketIO.Server;

  protected userMap = new Map<string, GitHubUser>();

  protected setUpEvents(): void {
    this.server.on("connection", this.onConnection.bind(this));
  }

  private onConnection(socket: SocketIO.Socket): void {
    // everyone must be able to request to join, otherwise noone can join
    socket.on("connection/auth", userId => this.onAuth(socket, userId));

    socket.on("disconnect", () => {
      this.userMap.delete(socket.id);
    });
  }

  protected async onAuth(
    socket: SocketIO.Socket,
    userId: string
  ): Promise<void> {
    const response = await GitHub.getInstance().getUser(userId);

    if (this.userMap.has(socket.id)) {
      // Already authenticated, let's not join this one again
      return;
    }

    if (isUser(response)) {
      this.userMap.set(socket.id, response);

      // Tell user they are authenticated
      socket.emit("connection/auth-confirm");

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
    } else {
      // Tell user authentication failed
      socket.emit("connection/auth-fail");
    }
  }

  public getUser(socketId: string): GitHubUser | undefined {
    return this.userMap.get(socketId);
  }

  public static initialize(
    server: http.Server,
    frontendUrl: string,
    project: Project
  ): SocketServer {
    this.instance = new SocketServer();
    this.instance.server = socketio(server, { origins: frontendUrl });
    this.instance.project = project;
    this.instance.setUpEvents();
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
