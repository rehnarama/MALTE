import io from "socket.io-client";
import { getBackendUrl } from "./Environment";

class Socket {
  private static instance: Socket;
  private s: SocketIOClient.Socket;

  private isAuthenticated = false;

  private constructor() {
    this.s = io(getBackendUrl());
  }

  static getInstance(): Socket {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }

    if (!Socket.instance.isAuthenticated) {
      Socket.instance.authenticateConnection();
    }

    return Socket.instance;
  }

  public getSocket(): SocketIOClient.Socket {
    return this.s;
  }

  public authenticateConnection() {
    // cookies are stored in a ; separated list
    // regex used to filter out the text on the right side of "userId=" where the id is
    const regex = /(userId)=([^;]+)/g;
    const userId = regex.exec(document.cookie);
    if (userId && userId[2]) {
      this.s.emit("join-group", userId[2]);

      this.isAuthenticated = true;
    }
  }

  public static isAuthenticated() {
    return this.getInstance().isAuthenticated;
  }
}

export default Socket;
