import { promises as fs } from "fs";
import RGA from "rga/dist/RGA";

export default class File {
  private _path: string;
  get path(): string {
    return this._path;
  }
  private file: fs.FileHandle;
  private rga: RGA;

  private sockets: SocketIO.Socket[] = [];

  constructor(path: string) {
    this._path = path;
  }

  /**
   * Initialize the file defined in the constructor path.
   */
  public async initialize(): Promise<void> {
    await fs.appendFile(this.path, "console.log(\"hello world\")", { encoding: "utf8" });
    const fileContent: string = await fs.readFile(this.path, { encoding: "utf8" });
    this.rga = RGA.fromString(fileContent);
  }

  /**
   * Get the content of the file.
   */
  public getContent(): RGA {
    return this.rga;
  }

  public join(socket: SocketIO.Socket) {
    if (this.sockets.some(s => s.id === socket.id)) {
      return;
    }
    this.sockets.push(socket);
  }

  public leave(socket: SocketIO.Socket) {
    const i = this.sockets.findIndex(s => s.id === socket.id);
    if (i > -1) {
      this.sockets.splice(i, 1);
    }
  }
}
