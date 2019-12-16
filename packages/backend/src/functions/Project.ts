import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import File from "./File";
import { RGAOperationJSON } from "rga/dist/RGA";
import {
  CursorList,
  CursorMovement,
  CursorInfo
} from "malte-common/dist/Cursor";
import { User, UserList } from "malte-common/dist/UserList";
import SocketServer from "./socketServer/SocketServer";

export default class Project {
  private path: string;
  private watcher: chokidar.FSWatcher;
  private files: File[] = [];
  private sockets: SocketIO.Socket[] = [];

  private cursorMap: { [socketId: string]: CursorInfo } = {};

  constructor(path: string) {
    this.path = path;
  }

  public async initialize(autoCreate = true): Promise<void> {
    if (autoCreate) {
      this.createProject();
    }
    this.watcher = chokidar.watch(this.path);
  }

  public async createProject(): Promise<void> {
    await fs.mkdir(this.path, { recursive: true });
  }

  public getPath(): string {
    return this.path;
  }

  public getWatcher(): chokidar.FSWatcher {
    return this.watcher;
  }

  private async createFile(fileName: string): Promise<File> {
    const f = new File(this.absolutePath(fileName));
    await f.initialize();
    this.files.push(f);
    return f;
  }

  /**
   * Get a file from the project. If the file isn't open or doesn't exist
   * it is created.
   * @param filePath relative path of file to project
   */
  private async getFile(filePath: string): Promise<File> {
    const normalizedPath = filePath.replace(this.path, "");

    let f: File = this.files.find(f => {
      return f.path == this.absolutePath(normalizedPath);
    });
    if (f === undefined) {
      f = await this.createFile(normalizedPath);
    }
    return f;
  }

  private absolutePath(filePath: string): string {
    return path.join(this.path, filePath);
  }

  /**
   * Add a client to a project
   * @param socket the socket to the client that wants to join the Project
   * @returns true if successfully joined the project
   */
  public join(socket: SocketIO.Socket): boolean {
    if (this.sockets.find(s => s.id === socket.id)) {
      // You can't join twice
      return false;
    }

    this.sockets.push(socket);
    this.broadcastUserList();

    socket.on("buffer/join", async (data: { path: string }) => {
      if (socket.rooms["authenticated"]) {
        const path: string = data.path;
        const file = await this.getFile(path);
        const joined = file.join(socket);
        if (joined) {
          socket.emit("buffer/open", { path, content: file.getContent() });
          this.sendCursorList(socket);
        }
      }
    });

    socket.on("buffer/leave", async (data: { path: string }) => {
      const normalizedPath = data.path.replace(this.path, "");
      const path: string = normalizedPath;
      const file = await this.getFile(path);
      const canCloseFile = file.leave(socket);
      if (canCloseFile) {
        await this.closeFiles([file]);
      }
    });

    socket.on(
      "buffer/operation",
      async (data: { path: string; operation: RGAOperationJSON }) => {
        if (socket.rooms["authenticated"]) {
          const normalizedPath = data.path.replace(this.path, "");
          const file = this.files.find(
            f => f.path === this.absolutePath(normalizedPath)
          );
          if (file) {
            file.applyOperation(data.operation, socket);
          }
        }
      }
    );

    socket.on("cursor/move", (data: CursorMovement) =>
      this.onCursorMove(socket, data)
    );
    socket.on("disconnect", () => {
      this.removeSocket(socket);
    });
    socket.on("connection/signout", () => {
      this.removeSocket(socket);
    });

    return true;
  }

  broadcastUserList = (): void => {
    const socketServer = SocketServer.getInstance();
    const users: User[] = this.sockets
      .map(s => {
        const ghUser = socketServer.getUser(s.id);
        if (ghUser) {
          ghUser.socketId = s.id;
          return ghUser;
        } else {
          return null;
        }
      })
      .filter(s => s !== null);
    const userList: UserList = { users };

    socketServer.server.in("authenticated").emit("user/list", userList);
  };

  onCursorMove = (socket: SocketIO.Socket, data: CursorMovement): void => {
    this.cursorMap[socket.id] = {
      ...data,
      login: SocketServer.getInstance().getUser(socket.id).login,
      socketId: socket.id
    };
    this.broadcastCursorList();
  };

  private async closeFiles(files: File[]): Promise<void> {
    for (const file of files) {
      const i = this.files.findIndex(f => f.path === file.path);
      this.files.splice(i, 1);
      await file.close();
    }
  }

  public async removeSocket(socket: SocketIO.Socket): Promise<void> {
    const index = this.sockets.findIndex(s => s.id === socket.id);
    if (index) {
      this.sockets.splice(index, 1);
      this.broadcastUserList();
    }
    if (this.cursorMap[socket.id]) {
      delete this.cursorMap[socket.id];
      this.broadcastCursorList();
    }

    const filesToClose: File[] = [];
    for (const file of this.files) {
      const canCloseFile = file.leave(socket);
      if (canCloseFile) filesToClose.push(file);
    }
    await this.closeFiles(filesToClose);
  }

  private broadcastCursorList(): void {
    const cursorList: CursorList = Object.values(this.cursorMap);
    SocketServer.getInstance()
      .server.in("authenticated")
      .emit("cursor/list", cursorList);
  }
  private sendCursorList(socket: SocketIO.Socket): void {
    const cursorList: CursorList = Object.values(this.cursorMap);
    socket.emit("cursor/list", cursorList);
  }
}
