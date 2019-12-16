import { User as UserData } from "malte-common/dist/oauth/GitHub";
import { Terminal } from "../terminal";
import { FileSystem } from "../filesystem";
import { removeSession } from "../session";
import Project from "../Project";
import GitHub from "../oauth/GitHub";
import fsTree from "../fsTree";

class User {
  private userId: string | null = null;
  private userData: UserData | null = null;
  private socket: SocketIO.Socket | null = null;
  private terminal: Terminal | null = null;
  private fileSystem: FileSystem | null = null;
  private project: Project | null = null;

  constructor(socket: SocketIO.Socket) {
    this.socket = socket;
  }

  public async destroyUser(): Promise<void> {
    this.project.removeSocket(this.socket);
    this.fileSystem.destroy();
    this.terminal.kill();
    GitHub.getInstance().removeUser(this.socket.id);

    this.socket.off("file/tree-refresh", this.onFileTreeRefresh);

    this.socket.leave("authenticated");

    await removeSession(this.userId);

    this.userId = null;
    this.userData = null;
    this.terminal = null;
    this.fileSystem = null;
    this.project = null;
  }

  public authorizeUser(
    userId: string,
    userData: UserData,
    terminal: Terminal,
    fileSystem: FileSystem,
    project: Project
  ): void {
    this.userId = userId;
    this.userData = userData;
    this.terminal = terminal;
    this.fileSystem = fileSystem;
    this.project = project;

    const socket = this.socket;

    if (socket.rooms["authenticated"]) {
      // Already authenticated, let's not join this one again but at least tell
      // them they are authenticated in case client has lost its state
      socket.emit("connection/auth-confirm");
      return;
    }
    socket.join("authenticated");

    // Listen on refresh reqeusts
    socket.on("file/tree-refresh", this.onFileTreeRefresh);

    // Join the project to allow editing of files
    this.project.join(socket);

    // Tell user they are authenticated
    socket.emit("connection/auth-confirm");
  }

  public onFileTreeRefresh = async (): Promise<void> => {
    this.socket.emit("file/tree", await fsTree(this.project.getPath()));
  };

  public getUserData(): UserData {
    return this.userData;
  }

  public getSocketId(): string {
    return this.socket.id;
  }

  public getSocket(): SocketIO.Socket {
    return this.socket;
  }
}

export default User;
