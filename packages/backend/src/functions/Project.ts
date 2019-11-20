import { promises as fs } from "fs";
import path from "path";
import chokidar from "chokidar";
import File from "./File";

export default class Project {
  private path: string;
  private watcher: chokidar.FSWatcher;
  private files: File[] = [];
  private socketIds: string[] = [];

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
    const f = new File(path.join(this.path, fileName));
    await f.initialize();
    this.files.push(f);
    return f;
  }

  /**
   * Get a file from the project. If the file isn't open or doesn't exist
   * it is created.
   * @param path path of file
   */
  private async getFile(path: string): Promise<File> {
    let f: File = this.files.find((f) => {
      return f.path === path;
    });
    if (f === undefined) {
      f = await this.createFile(path);
    }
    return f;
  }

  public join(socket: SocketIO.Socket): void {
    if (this.socketIds.includes(socket.id)) {
      // You can't join twice
      return;
    }

    this.socketIds.push(socket.id);

    socket.on("join-buffer", async (data: {path: string}) => {
      const path: string = data.path;
      const file = await this.getFile(path);
      file.join(socket);
      socket.emit("open-buffer", {path, content: file.getContent()});
    });

    socket.on("leave-buffer", async (data: {path: string}) => {
      const path: string = data.path;
      const file = await this.getFile(path);
      file.leave(socket);
    });
  }
}
