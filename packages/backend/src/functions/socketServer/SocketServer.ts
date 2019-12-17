import socketio from "socket.io";
import http from "http";
import { Terminal } from "../terminal";
import { FileSystem } from "../filesystem";
import Project from "../Project";
import { getUserFromId } from "../oauth/user";
import { getSession, updateSessionTimestamp } from "../session";
import { User } from "../user";
import { User as UserData } from "malte-common/dist/oauth/GitHub";
import {
  addPreApproved,
  removePreApproved,
  getAllPreapproved
} from "../oauth/PreApprovedUser";

type SocketId = string;

type listener = (...args: any[]) => void; //eslint-disable-line

export default class SocketServer {
  protected static instance: SocketServer;

  protected project: Project;
  public server: SocketIO.Server;

  protected userMap = new Map<SocketId, User>();
  private listenerMap: {
    [socketId: string]: { [event: string]: listener };
  } = {};

  protected setUpEvents(): void {
    this.server.on("connection", this.onConnection.bind(this));
  }

  private onConnection(socket: SocketIO.Socket): void {
    this.userMap.set(socket.id, new User(socket));

    const listeners = (this.listenerMap[socket.id] = {});

    listeners["connection/auth"] = (userId: string): void => {
      this.onAuth(socket, userId);
    };
    listeners["disconnect"] = (): void => {
      this.userMap.delete(socket.id);
    };

    // everyone must be able to request to join, otherwise no one can join
    socket.on("connection/auth", listeners["connection/auth"]);
    socket.on("disconnect", listeners["disconnect"]);
  }

  protected async onAuth(
    socket: SocketIO.Socket,
    userId: string
  ): Promise<void> {
    if (socket.rooms["authenticated"]) {
      // Already authenticated, let's not join this one again but at least tell
      // them they are authenticated in case client has lost its state
      socket.emit("connection/auth-confirm");
      return;
    }

    const sessions = await getSession(userId);
    if (sessions.length > 0) {
      const user = await getUserFromId(sessions[0].id);
      this.authorizeSocket(socket, userId, user);
      await updateSessionTimestamp(userId);
    } else {
      socket.emit("connection/auth-fail");
    }
  }

  private async authorizeSocket(
    socket: socketio.Socket,
    userId: string,
    userData: UserData
  ): Promise<void> {
    if (socket.rooms["authenticated"]) {
      // Already authenticated, let's not join this one again but at least tell
      // them they are authenticated in case client has lost its state
      socket.emit("connection/auth-confirm");
      return;
    }

    const user = this.userMap.get(socket.id);
    user.authorizeUser(
      userId,
      userData,
      new Terminal(socket, this.project.getPath()),
      new FileSystem(socket, this.project.getPath()),
      this.project
    );

    const listeners = this.listenerMap[socket.id];

    listeners["authorized/add"] = async (user: {
      login: string;
    }): Promise<void> => {
      if (user && user.login) {
        await addPreApproved(user.login);
        SocketServer.getInstance()
          .server.to("authenticated")
          .emit("authorized/list", await getAllPreapproved());
      }
    };

    listeners["authorized/remove"] = async (data: {
      login: string;
    }): Promise<void> => {
      if (data && data.login && this.getUserLogin(socket.id) !== data.login) {
        await removePreApproved(data.login);
        SocketServer.getInstance()
          .server.to("authenticated")
          .emit("authorized/list", await getAllPreapproved());

        const removedUsers = this.getUsersWithLogin(data.login);
        for (const u of removedUsers) {
          this.destroyUser(u);
          u.getSocket().emit("authorized/removed");
        }
      }
    };

    listeners["connection/signout"] = (): void => {
      this.destroyUser(this.userMap.get(socket.id));
      socket.emit("connection/signout");
    };

    listeners["authorized/fetch"] = async (): Promise<void> => {
      socket.emit("authorized/list", await getAllPreapproved());
    };

    socket.on("connection/signout", listeners["connection/signout"]);
    socket.on("authorized/add", listeners["authorized/add"]);
    socket.on("authorized/remove", listeners["authorized/remove"]);
    socket.on("authorized/fetch", listeners["authorized/fetch"]);
  }

  public getUserLogin(socketId: string): string | undefined {
    return this.userMap.get(socketId).getUserData().login;
  }

  public getUserData(socketId: string): UserData | undefined {
    return this.userMap.get(socketId)?.getUserData();
  }

  public destroyUser(login: string): void;
  public destroyUser(user: User): void;
  public destroyUser(user: User | string): void {
    const sessions = [];
    if (user instanceof User) {
      sessions.push(user);
    } else if (typeof user === "string") {
      sessions.push(...this.getUsersWithLogin(user));
    }

    for (const session of sessions) {
      const socket = session.getSocket();

      session.destroyUser();
      const listeners = this.listenerMap[session.getSocketId()];
      socket.off("authorized/add", listeners["authorized/add"]);
      socket.off("authorized/remove", listeners["authorized/remove"]);
      socket.off("authorized/fetch", listeners["authorized/fetch"]);
      socket.off("connection/signout", listeners["connection/signout"]);
    }
  }

  private getUsersWithLogin(user: string): User[] {
    const sessions = [];
    this.userMap.forEach(u => {
      if (u.getUserData().login === user) {
        sessions.push(u);
      }
    });
    return sessions;
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
