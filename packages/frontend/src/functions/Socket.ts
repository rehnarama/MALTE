import io from "socket.io-client";
import { getBackendUrl } from "./Environment";

export enum AuthenticationStatus {
  Unknown,
  Authenticated,
  Unauthenticated,
  Failed
}

class Socket {
  private static instance: Socket;
  private s: SocketIOClient.Socket;

  private isAuthenticated = AuthenticationStatus.Unauthenticated;

  private constructor() {
    this.s = io(getBackendUrl());

    this.s.on("connection/auth-confirm", () => {
      this.isAuthenticated = AuthenticationStatus.Authenticated;
    });

    this.s.on("connection/auth-fail", () => {
      this.isAuthenticated = AuthenticationStatus.Failed;
      // Let's remove cookie, maybe that's why we failed
      document.cookie = "userId=;Max-Age=0;";
      // Let's reload to force components to reload like login button
      //window.location.reload(true);
    });
  }

  static getInstance(): Socket {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }

    if (
      Socket.instance.isAuthenticated === AuthenticationStatus.Unauthenticated
    ) {
      Socket.instance.authenticateConnection();
    }

    return Socket.instance;
  }

  public getSocket(): SocketIOClient.Socket {
    return this.s;
  }

  public authenticateConnection() {
    if (this.isAuthenticated !== AuthenticationStatus.Authenticated) {
      this.isAuthenticated = AuthenticationStatus.Unknown;
      // cookies are stored in a ; separated list
      // regex used to filter out the text on the right side of "userId=" where the id is
      const regex = /(userId)=([^;]+)/g;
      const userId = regex.exec(document.cookie);
      if (userId && userId[2]) {
        this.s.emit("connection/auth", userId[2]);
      }
    }
  }

  public static isAuthenticated() {
    return this.getInstance().isAuthenticated;
  }
}

export default Socket;
