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
      this.triggerSave();
    } else if (!this.isSaveScheduled()) {
      // If we have no save scheduled, let's schedule one
      const waitTime = Math.max(this.maxSaveRate - deltaTime, 0);
      this.saveTimeoutHandle = setTimeout(
        this.triggerSave.bind(this),
        waitTime
      );
    }
    // If we have save scheduled, let's simply ignore this save trigger
  }

  private triggerSave(): void {
    this.triggerSaveAsync();
  }

  private async triggerSaveAsync(): Promise<void> {
    if (this.isSaveScheduled()) {
      // Alright, let's clear the old handle
      this.cancelSave();
    }
    this.lastSave = Date.now();
    await this.save();
  }

  public cancelSave(): void {
    if (this.saveTimeoutHandle !== null) {
      clearTimeout(this.saveTimeoutHandle);
      this.saveTimeoutHandle = null;
    }
  }

  public isSaveScheduled(): boolean {
    return this.saveTimeoutHandle !== null;
  }

  private async save(): Promise<void> {
    if (await this.fileExists()) {
      await fs.writeFile(this.path, this.rga.toString(), {
        encoding: "utf8"
      });
    }
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

    return true;
  }

  /**
   * Removes a socket from a file.
   * @param socket socket to leave the file
   * @returns true if there are no more sockets associated with the file.
   */
  public leave(socket: Socket): boolean {
    const i = this.sockets.findIndex(s => s.id === socket.id);
    if (i > -1) {
      this.sockets.splice(i, 1);
    }
    return this.sockets.length === 0;
  }

  public async close(): Promise<void> {
    await this.triggerSaveAsync();
  }

  public applyOperations(
    ops: RGAOperationJSON[] | RGAOperationJSON,
    caller: Socket
  ): void {
    if (!Array.isArray(ops)) {
      ops = [ops];
    }

    for (const op of ops) {
      const rgaOp = rgaOperationFromJSON(op);
      this.rga.applyOperation(rgaOp);
    }
    this.scheduleSave();

    for (const s of this.sockets) {
      if (s.id !== caller.id) {
        s.emit("buffer/operation", { path: this.path, operations: ops });
      }
    }
  }
}
