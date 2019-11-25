import fs from "fs";
import RGA from "rga/dist/RGA";
import RGAInsert from "rga/dist/RGAInsert";
import RGARemove from "rga/dist/RGARemove";

export default class File {
  private _path: string;
  get path(): string {
    return this._path;
  }
  private file: fs.promises.FileHandle;
  private rga: RGA;

  private sockets: SocketIO.Socket[] = [];

  constructor(path: string) {
    this._path = path;
  }

  /**
   * Initialize the file defined in the constructor path.
   */
  public async initialize(): Promise<void> {
    //await fs.writeFile(this.path, 'console.log("hello world")', {
    //  encoding: "utf8"
    //});
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
  public getContent(): RGA {
    return this.rga;
  }

  public join(socket: SocketIO.Socket): boolean {
    if (this.sockets.some(s => s.id === socket.id)) {
      return false;
    }
    this.sockets.push(socket);

    socket.on(
      "buffer-operation",
      (data: { path: string; operation: RGAInsert | RGARemove }) => {}
    );

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
