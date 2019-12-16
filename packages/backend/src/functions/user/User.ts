import { User as UserData } from "malte-common/dist/oauth/GitHub";
import { Terminal } from "../terminal";
import { FileSystem } from "../filesystem";
import Database from "../db/Database";
import Project from "../Project";
import GitHub from "../oauth/GitHub";

class User {
  private userData: UserData;
  private socket: SocketIO.Socket;
  private terminal: Terminal;
  private fileSystem: FileSystem;
  private project: Project;

  constructor(
    userData: UserData,
    socket: SocketIO.Socket,
    terminal: Terminal,
    fileSystem: FileSystem,
    project: Project
  ) {
    this.userData = userData;
    this.socket = socket;
    this.terminal = terminal;
    this.fileSystem = fileSystem;
    this.project = project;
  }

  public destoryUser() {
    this.socket.emit("authorized/removed");
    this.socket.leave("authenticated");
    this.project.removeSocket(this.socket);
    GitHub.getInstance().removeUser(this.socket.id);

    const collectionSessions = Database.getInstance()
      .getDb()
      .collection("sessions");

    collectionSessions.deleteMany({ id: this.userData.id });
    this.terminal.kill();
  }

  public getUserData(): UserData {
    return this.userData;
  }

  public getSocketId(): string {
    return this.socket.id;
  }
}

export default User;
