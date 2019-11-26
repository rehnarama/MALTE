import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import File from "./File";
import { RGAOperationJSON } from "rga/dist/RGA";

export default class Project {
  private path: string;
  private watcher: chokidar.FSWatcher;
  private files: File[] = [];
  private sockets: SocketIO.Socket[] = [];

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
    let f: File = this.files.find(f => {
      return f.path == this.absolutePath(filePath);
    });
    if (f === undefined) {
      f = await this.createFile(filePath);
    }
    return f;
  }

  private absolutePath(filePath: string) {
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
      const path: string = data.path;
      const file = await this.getFile(path);
      const joined = file.join(socket);
      if (joined) {
        socket.emit("open-buffer", { path, content: file.getContent() });
      }
    });

    socket.on("leave-buffer", async (data: { path: string }) => {
      const path: string = data.path;
      const file = await this.getFile(path);
      file.leave(socket);
    });

    socket.on(
      "buffer-operation",
      async (data: { path: string; operation: RGAOperationJSON }) => {
        const file = this.files.find(f => f.path === this.absolutePath(data.path));
        if (file) {
          file.applyOperation(data.operation, socket);
        }
      }
    );

    socket.on("disconnect", () => {
      const index = this.sockets.findIndex(s => s.id === socket.id);
      if (index) {
        this.sockets.splice(index, 1);
      }
    });

    return true;
  }
}
