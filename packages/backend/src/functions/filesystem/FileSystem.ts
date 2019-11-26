import socketio from "socket.io";
import { FileOperation, Operation } from "malte-common/dist/FileSystem";
import { promises as fs } from "fs";
import path from "path";

class FileSystem {
  private projectRoot: string;
  constructor(socket: socketio.Socket, projectRoot: string) {
    this.projectRoot = projectRoot;

    socket.on("file/operation", data => {
      this.parseData(data);
    });
  }

  private parseData(data: FileOperation): void {
    if (data?.operation === null || data.name === null) {
      return;
    }
    if (data.dir === null) {
      data.dir = "./";
    }
    if (data.operation === Operation.mkdir) {
      this.createDirectory(data.dir, data.name);
    }
  }

  public async createDirectory(
    dir: string,
    name: string,
    pass = true
  ): Promise<boolean> {
    fs.mkdir(path.join(this.projectRoot, dir, name), { recursive: pass });
    return true;
  }
}
export default FileSystem;
