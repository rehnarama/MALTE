import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import File from "./File";
import { RGAOperationJSON } from "rga/dist/RGA";
import { CursorList, CursorMovement } from "malte-common/dist/Cursor";

export default class Project {
  private path: string;
  private watcher: chokidar.FSWatcher;
  private files: File[] = [];
  private sockets: SocketIO.Socket[] = [];

  private cursorList: CursorList = [];

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

    socket.on("join-buffer", async (data: { path: string }) => {
      if (socket.rooms["authenticated"]) {
        const path: string = data.path;
        const file = await this.getFile(path);
        const joined = file.join(socket);
        if (joined) {
          socket.emit("open-buffer", { path, content: file.getContent() });
        }
      }
    });

    socket.on("leave-buffer", async (data: { path: string }) => {
      const normalizedPath = data.path.replace(this.path, "");
      const path: string = normalizedPath;
      const file = await this.getFile(path);
      file.leave(socket);
    });

    socket.on(
      "buffer-operation",
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
      const index = this.sockets.findIndex(s => s.id === socket.id);
      if (index) {
        this.sockets.splice(index, 1);
      }

      this.cursorList = this.cursorList.filter(c => c.userId !== socket.id);
      socket.server.emit("cursor/list", this.cursorList);
    });

    return true;
  }

  onCursorMove = (socket: SocketIO.Socket, data: CursorMovement): void => {
    if (this.cursorList.some(c => c.userId === socket.id)) {
      this.cursorList = this.cursorList.map(c => {
        if (c.userId === socket.id) {
          return {
            ...c,
            id: data.id,
            path: data.path
          };
        } else {
          return c;
        }
      });
    } else {
      this.cursorList.push({
        userId: socket.id,
        id: data.id,
        path: data.path
      });
    }

    socket.server.emit("cursor/list", this.cursorList);
  };
}
