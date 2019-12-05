import io from "socket.io-client";
import { getBackendUrl } from "./Environment";
import { AuthenticationStatus } from "./AuthenticationStatus";

class Socket {
  private static instance: Socket;
  private s: SocketIOClient.Socket;

  private authenticationStatus = AuthenticationStatus.Unauthenticated;

  private constructor() {
    this.s = io(getBackendUrl());

    this.s.on("connection/auth-confirm", () => {
      this.authenticationStatus = AuthenticationStatus.Authenticated;
    });

    this.s.on("connection/auth-fail", () => {
      this.authenticationStatus = AuthenticationStatus.Failed;
      // Let's remove cookie, maybe that's why we failed
      document.cookie = "userId=;Max-Age=0;";
    });
  }

  static getInstance(): Socket {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }

    if (
      Socket.instance.authenticationStatus ===
      AuthenticationStatus.Unauthenticated
    ) {
      Socket.instance.authenticateConnection();
    }

    return Socket.instance;
  }

  public getSocket(): SocketIOClient.Socket {
    return this.s;
  }

  public authenticateConnection() {
    if (this.authenticationStatus !== AuthenticationStatus.Authenticated) {
      // cookies are stored in a ; separated list
      // regex used to filter out the text on the right side of "userId=" where the id is
      const regex = /(userId)=([^;]+)/g;
      const userId = regex.exec(document.cookie);
      if (userId && userId[2]) {
        this.authenticationStatus = AuthenticationStatus.Unknown;
        this.s.emit("connection/auth", userId[2]);
      }
    }
  }

  public static getAuthenticationStatus() {
    return this.getInstance().authenticationStatus;
  }
}

export default Socket;
