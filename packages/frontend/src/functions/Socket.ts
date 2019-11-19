import io from "socket.io-client";

class Socket {
  private static instance: Socket;
  private s: SocketIOClient.Socket;

  private constructor() {
    let backendUrl = "localhost:4000";
    if (process.env.REACT_APP_BACKEND_URL) {
      backendUrl = process.env.REACT_APP_BACKEND_URL;
    }
    this.s = io(backendUrl);
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
