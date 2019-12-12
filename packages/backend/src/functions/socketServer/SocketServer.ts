import socketio from "socket.io";
import http from "http";
import { Terminal } from "../terminal";
import { FileSystem } from "../filesystem";
import Project from "../Project";
import fsTree from "../fsTree";
import { getUserFromId } from "../oauth/user";
import {
  addPreApproved,
  removePreApproved,
  getAllPreapproved
} from "../oauth/PreApprovedUser";
import { User as GitHubUser } from "malte-common/dist/oauth/GitHub";
import { getSession, updateSessionTimestamp, removeSession } from "../session";

export default class SocketServer {
  protected static instance: SocketServer;

  protected project: Project;
  public server: SocketIO.Server;

  protected userMap = new Map<string, GitHubUser>();

  protected setUpEvents(): void {
    this.server.on("connection", this.onConnection.bind(this));
  }

  private onConnection(socket: SocketIO.Socket): void {
    // everyone must be able to request to join, otherwise no one can join
    socket.on("connection/auth", userId => this.onAuth(socket, userId));
    socket.on("connection/signout", userId => this.signOut(socket, userId));

    socket.on("disconnect", () => {
      this.userMap.delete(socket.id);
    });
  }

  private async signOut(
    socket: SocketIO.Socket,
    userId: string
  ): Promise<void> {
    await removeSession(userId);
    this.userMap.delete(socket.id);
    socket.emit("connection/signout");
    socket.leave("authenticated");
  }

  protected async onAuth(
    socket: SocketIO.Socket,
    userId: string
  ): Promise<void> {
    if (socket.rooms["authenticated"]) {
      // Already authenticated, let's not join this one again
      return;
    }

    const sessions = await getSession(userId);
    if (sessions.length > 0) {
      const user = await getUserFromId(sessions[0].id);
      this.authorizeSocket(socket, user);
      await updateSessionTimestamp(userId);
    } else {
      socket.emit("connection/auth-fail");
    }
  }

  private async authorizeSocket(
    socket: socketio.Socket,
    user: GitHubUser
  ): Promise<void> {
    socket.join("authenticated");
    this.userMap.set(socket.id, user);
    // Tell user they are authenticated
    socket.emit("connection/auth-confirm");
    this.project.join(socket);
    new Terminal(socket, this.project.getPath());
    new FileSystem(socket, this.project.getPath());

    socket.on("file/tree-refresh", async () => {
      // send file tree on request from client
      socket.emit("file/tree", await fsTree(this.project.getPath()));
    });
    socket.on("authorized/add", async user => {
      if (user && user.login) {
        await addPreApproved(user.login);
        this.server
          .to("authenticated")
          .emit("authorized/list", await getAllPreapproved());
      }
    });
    socket.on("authorized/remove", async user => {
      if (user && user.login && this.getUser(socket.id).login !== user.login) {
        await removePreApproved(user.login);
        this.server
          .to("authenticated")
          .emit("authorized/list", await getAllPreapproved());
      }
    });
    socket.on("authorized/fetch", async () => {
      socket.emit("authorized/list", await getAllPreapproved());
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
