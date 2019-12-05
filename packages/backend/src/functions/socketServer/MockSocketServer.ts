/* eslint-disable */
import SocketServer from "./SocketServer";
import MockSocketIoServer from "./MockSocketIoServer";
import { User as GitHubUser } from "malte-common/dist/oauth/GitHub";

function MockSocketServer() {
  this.server = new MockSocketIoServer();
  this.userMap = new Map<string, GitHubUser>();
}
MockSocketServer.prototype = Object.create(SocketServer.prototype);

MockSocketServer.prototype["getInstance"] = function() {
  if (!MockSocketServer["instance"]) {
    MockSocketServer["instance"] = new MockSocketServer();
  }
  return MockSocketServer["instance"];
};


export default MockSocketServer;
