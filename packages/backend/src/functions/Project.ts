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

type listener = (...args: any[]) => void; //eslint-disable-line

export default class Project {
  private path: string;
  private watcher: chokidar.FSWatcher;
  private files: File[] = [];
  private sockets: SocketIO.Socket[] = [];

  private cursorMap: { [socketId: string]: CursorInfo } = {};

  private listenerMap: {
    [socketId: string]: { [event: string]: listener };
  } = {};

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

    const listeners = (this.listenerMap[socket.id] = {});
    listeners["buffer/join"] = async (data: {
      path: string;
    }): Promise<void> => {
      if (socket.rooms["authenticated"]) {
        const path: string = data.path;
        const file = await this.getFile(path);
        const joined = file.join(socket);
        if (joined) {
          socket.emit("buffer/open", { path, content: file.getContent() });
          this.sendCursorList(socket);
        }
      }
    };

    listeners["buffer/leave"] = async (data: {
      path: string;
    }): Promise<void> => {
      const normalizedPath = data.path.replace(this.path, "");
      const path: string = normalizedPath;
      const file = await this.getFile(path);
      const canCloseFile = file.leave(socket);
      if (canCloseFile) {
        await this.closeFiles([file]);
      }
    };

    listeners["buffer/operation"] = async (data: {
      path: string;
      operations: RGAOperationJSON[];
    }): Promise<void> => {
      if (socket.rooms["authenticated"]) {
        const normalizedPath = data.path.replace(this.path, "");
        const file = this.files.find(
          f => f.path === this.absolutePath(normalizedPath)
        );
        if (file) {
          file.applyOperations(data.operations, socket);
        }
      }
    };

    listeners["cursor/move"] = (data: CursorMovement): void => {
      this.onCursorMove(socket, data);
    };

    socket.on("buffer/join", listeners["buffer/join"]);
    socket.on("buffer/leave", listeners["buffer/leave"]);
    socket.on("buffer/operation", listeners["buffer/operation"]);
    socket.on("cursor/move", listeners["cursor/move"]);

    return true;
  }

  broadcastUserList = (): void => {
    const socketServer = SocketServer.getInstance();
    const users: User[] = this.sockets
      .map(s => {
        const ghUser = socketServer.getUserData(s.id);
        if (ghUser) {
          return { ...ghUser, socketId: s.id };
        } else {
          return null;
        }
      })
      .filter(s => s !== null);
    const userList: UserList = { users };

    socketServer.broadcast("user/list", userList);
  };

  onCursorMove = (socket: SocketIO.Socket, data: CursorMovement): void => {
    this.cursorMap[socket.id] = {
      ...data,
      login: SocketServer.getInstance().getUserData(socket.id).login,
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

  public removeSocket(socket: SocketIO.Socket): boolean {
    const index = this.sockets.findIndex(s => s.id === socket.id);
    if (index !== -1) {
      const socket = this.sockets.splice(index, 1)[0];
      this.broadcastUserList();

      const listeners = this.listenerMap[socket.id];
      socket.off("buffer/join", listeners["buffer/join"]);
      socket.off("buffer/leave", listeners["buffer/leave"]);
      socket.off("buffer/operation", listeners["buffer/operation"]);
      socket.off("cursor/move", listeners["cursor/move"]);

      if (this.cursorMap[socket.id]) {
        delete this.cursorMap[socket.id];
        this.broadcastCursorList();
      }

      const filesToClose: File[] = [];
      for (const file of this.files) {
        const canCloseFile = file.leave(socket);
        if (canCloseFile) filesToClose.push(file);
      }
      this.closeFiles(filesToClose);
      return true;
    }
    return false;
  }

  private broadcastCursorList(): void {
    const cursorList: CursorList = Object.values(this.cursorMap);
    SocketServer.getInstance().broadcast("cursor/list", cursorList);
  }

  private sendCursorList(socket: SocketIO.Socket): void {
    const cursorList: CursorList = Object.values(this.cursorMap);
    socket.emit("cursor/list", cursorList);
  }
}
