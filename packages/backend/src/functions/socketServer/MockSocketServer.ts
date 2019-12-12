/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/camelcase */

import SocketServer from "./SocketServer";
import MockSocketIoServer from "./MockSocketIoServer";
import MockSocket from "./MockSocket";

class MockSocketServer extends SocketServer {
  constructor() {
    super();
    this.server = new MockSocketIoServer();
    this.setUpEvents();
  }

  getInstance(): SocketServer {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  async onAuth(socket: MockSocket, _userId: string): Promise<void> {
    // In tests, we should always allow confirmation
    socket.join("authenticated");
    socket.emit("connection/auth-confirm");
    this.userMap.set(socket.id, {
      id: 123,
      url: "https://github.com/my-user",
      login: "my-user",
      avatar_url: "myavatar.png"
    });
  }
}

export default MockSocketServer;
