import fs from "fs";
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
  private file: fs.promises.FileHandle;
  private rga: RGA;

  private sockets: Socket[] = [];

  constructor(path: string) {
    this._path = path;
  }

  /**
   * Initialize the file defined in the constructor path.
   */
  public async initialize(): Promise<void> {
    let fileContent = "";
    if (fs.existsSync(this.path)) {
      fileContent = await fs.promises.readFile(this.path, {
        encoding: "utf8"
      });
    } else {
      await fs.promises.writeFile(this.path, "", {
        encoding: "utf8"
      });
    }
    this.rga = RGA.fromString(fileContent);
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
    console.log("Current RGA: " + this.rga.toString());
    for (const s of this.sockets) {
      if (s.id !== caller.id) {
        s.emit("buffer-operation", { path: this.path, operation: rgaOp });
      }
    }
  }
}
