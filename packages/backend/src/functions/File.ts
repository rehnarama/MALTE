import { promises as fs } from "fs";
import RGA from "rga/dist/RGA";

export default class File {
  private _path: string;
  get path(): string {
    return this._path;
  }

  private rga: RGA;

  private sockets: SocketIO.Socket[] = [];

  private lastSave = 0;
  private maxSaveRate: number;
  private saveTimeoutHandle: NodeJS.Timeout | null = null;

  constructor(path: string, maxSaveRate = 5000) {
    this._path = path;
    this.maxSaveRate = maxSaveRate;
  }

  /**
   * Initialize the file defined in the constructor path.
   */
  public async initialize(): Promise<void> {
    console.log("Initializing file");
    await fs.writeFile(this.path, 'console.log("hello world")', {
      encoding: "utf8"
    });
    const fileContent: string = await fs.readFile(this.path, {
      encoding: "utf8"
    });
    this.rga = RGA.fromString(fileContent);
  }

  /**
   * Triggers a save. The save will occur in the next `maxSaveRate` milliseconds
   * as defined in the constructor
   */
  public triggerSave(): void {
    const deltaTime = Date.now() - this.lastSave;

    if (deltaTime >= this.maxSaveRate) {
      // If no save is scheduled and we haven't saved in the last 5 seconds
      // let's simply save

      if (this.saveTimeoutHandle !== null) {
        // Alright, let's clear the old handle
        clearTimeout(this.saveTimeoutHandle);
        this.saveTimeoutHandle = null;
      }
      this.lastSave = Date.now();
      this.save();
    } else if (this.saveTimeoutHandle === null) {
      // If we have no save scheduled, let's schedule one
      this.saveTimeoutHandle = setTimeout(
        this.triggerSave.bind(this),
        Math.max(this.maxSaveRate - deltaTime, 0)
      );
    }
    // If we have save scheduled, let's simply ignore this save trigger
  }

  /**
   * Forces a save
   */
  public async save(): Promise<void> {
    await fs.writeFile(this.path, this.rga.toString(), { encoding: "utf8" });
  }

  /**
   * Get the content of the file.
   */
  public getContent(): RGA {
    return this.rga;
  }

  public join(socket: SocketIO.Socket): boolean {
    if (this.sockets.some(s => s.id === socket.id)) {
      return false;
    }
    this.sockets.push(socket);

    socket.on("disconnect", () => {
      this.leave(socket);
    });
    return true;
  }

  public leave(socket: SocketIO.Socket): void {
    const i = this.sockets.findIndex(s => s.id === socket.id);
    if (i > -1) {
      this.sockets.splice(i, 1);
    }
  }
}
