/* eslint-disable */
import SocketServer from "./SocketServer";
import MockSocketIoServer from "./MockSocketIoServer";
import { User as GitHubUser } from "malte-common/dist/oauth/GitHub";
import MockSocket from "./MockSocket";

class MockSocketServer extends SocketServer {
  constructor() {
    super();
    this.server = new MockSocketIoServer();
    this.setUpEvents();
  }

  getInstance() {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  async onAuth(socket: MockSocket, _userId: string): Promise<void> {
    // In tests, we should always allow confirmation
    socket.join("authenticated");
    socket.emit("connection/auth-confirm");
  }
}

export default MockSocketServer;
