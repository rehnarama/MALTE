import io from "socket.io-client";
import { getBackendUrl } from "./Environment";

class Socket {
  private static instance: Socket;
  private s: SocketIOClient.Socket;

  private constructor() {
    this.s = io(getBackendUrl());
  }

  static getInstance(): Socket {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }
    return Socket.instance;
  }

  public getSocket(): SocketIOClient.Socket {
    return this.s;
  }
}

export default Socket;
