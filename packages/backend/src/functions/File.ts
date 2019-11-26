import { promises as fs } from "fs";
import RGA, {
  RGAJSON,
  RGAOperationJSON,
  rgaOperationFromJSON
} from "rga/dist/RGA";
import { Socket } from "socket.io";

export default class File {
  private _path: string;
  get path(): string {
    return this._path;
  }
  private rga: RGA;

  private sockets: Socket[] = [];

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
    let fileContent = "";
    if (await this.fileExists()) {
      fileContent = await fs.readFile(this.path, {
        encoding: "utf8"
      });
    } else {
      await fs.writeFile(this.path, "", {
        encoding: "utf8"
      });
    }
    this.rga = RGA.fromString(fileContent);
  }

  private async fileExists(): Promise<boolean> {
    try {
      await fs.stat(this.path);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Schedules a save. The save will occur in the next `maxSaveRate` milliseconds
   * as defined in the constructor
   */
  public scheduleSave(): void {
    const deltaTime = Date.now() - this.lastSave;

    if (deltaTime >= this.maxSaveRate) {
      // If no save is scheduled and we haven't saved in the last 5 seconds
      // let's simply save

      if (this.isSaveScheduled()) {
        // Alright, let's clear the old handle
        clearTimeout(this.saveTimeoutHandle);
        this.saveTimeoutHandle = null;
      }
      this.lastSave = Date.now();
      this.save();
    } else if (!this.isSaveScheduled()) {
      // If we have no save scheduled, let's schedule one
      this.saveTimeoutHandle = setTimeout(
        this.scheduleSave.bind(this),
        Math.max(this.maxSaveRate - deltaTime, 0)
      );
    }
    // If we have save scheduled, let's simply ignore this save trigger
  }

  public isSaveScheduled(): boolean {
    return this.saveTimeoutHandle !== null;
  }

  /**
   * Forces a save
   */
  public async save(): Promise<void> {
    await fs.writeFile(this.path, this.rga.toString(), {
      encoding: "utf8"
    });
  }

  /**
   * Get the content of the file.
   */
  public getContent(): RGAJSON {
    return this.rga.toRGAJSON();
  }

  public join(socket: Socket): boolean {
    if (this.sockets.some(s => s.id === socket.id)) {
      return false;
    }
    this.sockets.push(socket);

    socket.on("disconnect", () => {
      this.leave(socket);
    });
    return true;
  }

  public leave(socket: Socket): void {
    const i = this.sockets.findIndex(s => s.id === socket.id);
    if (i > -1) {
      this.sockets.splice(i, 1);
    }
  }

  public applyOperation(op: RGAOperationJSON, caller: Socket): void {
    const rgaOp = rgaOperationFromJSON(op);
    this.rga.applyOperation(rgaOp);
    this.scheduleSave();

    for (const s of this.sockets) {
      if (s.id !== caller.id) {
        s.emit("buffer-operation", { path: this.path, operation: rgaOp });
      }
    }
  }
}
