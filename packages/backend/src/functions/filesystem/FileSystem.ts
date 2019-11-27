import socketio from "socket.io";
import { FileOperation, Operation } from "malte-common/dist/FileSystem";
import { promises as fs } from "fs";
import path from "path";

/**
 * A class to interact with the underlying file system
 * using a specified API (see Wiki pages on Github for
 * specification, https://github.com/rehnarama/MALTE/wiki/API-File)
 */
class FileSystem {
  private projectRoot: string;
  private static WORKSPACE_ROOT = "./";

  constructor(socket: socketio.Socket, projectRoot: string) {
    this.projectRoot = projectRoot;

    socket.on("file/operation", data => {
      this.parseData(data);
    });
  }

  private parseData(data: FileOperation): void {
    if (data?.operation === undefined || data?.name === undefined) {
      return;
    }
    if (data?.dir === undefined) {
      data.dir = "./";
    }
    if (data.operation === Operation.mkdir) {
      this.createDirectory(data.dir, data.name);
    } else if (data.operation === Operation.rm) {
      this.remove(data.dir, data.name);
    } else if (data.operation === Operation.touch) {
      this.createFile(data.dir, data.name);
    } else if (data.operation === Operation.mv) {
      this.move(data.dir, data.name, data.newDir, data.newName);
    }
  }

  /**
   * Create a new directory. Will not fail if the
   * directory already exists if pass is true.
   * @param dir The workspace path
   * @param name The name of the new directory
   * @param pass Optional, default to true
   */
  public async createDirectory(
    dir: string,
    name: string,
    pass = true
  ): Promise<boolean> {
    try {
      await fs.mkdir(path.join(this.projectRoot, dir, name), {
        recursive: pass
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Create a new empty file. If file already exists
   * nothing will happen and function returns false.
   * @param dir The workspace path
   * @param name The name of the new file
   * @param overwrite Optional, will overwrite if set to true, default is false
   */
  public async createFile(
    dir: string,
    name: string,
    overwrite = false
  ): Promise<boolean> {
    try {
      const fd = await fs.open(
        path.join(this.projectRoot, dir, name),
        overwrite ? "w" : "a"
      );
      await fd.close();
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Removes a directory and its subfolders or a file
   * @param dir The workspace path
   * @param name The name of the folder or file to be deleted
   */
  public async remove(dir: string, name: string): Promise<boolean> {
    try {
      await fs.rmdir(path.join(this.projectRoot, dir, name), {
        recursive: true
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Move or rename a folder or file.
   * @param dir The workspace path
   * @param name The name of the folder or file to be moved or renamed
   * @param newDir New path, if ommited it defaults to the old path, `dir`
   * @param newName New name, if ommited it defaults to the old name, `name`
   */
  public async move(
    dir: string,
    name: string,
    newName?: string,
    newDir?: string
  ): Promise<boolean> {
    if (newDir === undefined) {
      newDir = dir;
    }
    if (newName === undefined) {
      newName = name;
    }
    try {
      await fs.rename(
        path.join(this.projectRoot, dir, name),
        path.join(this.projectRoot, newDir, newName)
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Exposes the constant that defines the root
   * of the workspace.
   *
   * Exposed to allow proper testing, only for
   * internal use.
   */
  public static getWorkspaceRoot(): string {
    return FileSystem.WORKSPACE_ROOT;
  }
}
export default FileSystem;
