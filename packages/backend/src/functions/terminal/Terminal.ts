import * as pty from "node-pty";
import socketio from "socket.io";
import TerminalSize from "malte-common/dist/Terminal";

const SHELL = process.platform === "win32" ? "powershell.exe" : "bash";

/**
 * Picks the given keys from the object, if they exist, and return a new object
 * with the given keys and the given keys only
 * @param obj   The source object from which values will be extracted from, if
 *              they exist
 * @param keys  The keys array which will extract values from `obj`, if they
 *              exist.
 * @returns A new object with the keys in `keys` and values in `obj`, if the
 *          keys existed in `values` to begin with.
 */
function pick(
  obj: { [key: string]: string },
  keys: string[]
): { [key: string]: string } {
  const picked: { [key: string]: string } = {};
  for (const key of keys) {
    if (typeof obj[key] !== "undefined") {
      picked[key] = obj[key];
    }
  }
  return picked;
}

/**
 * Create a pseudo-terminal and pipe the std-out/in to
 * a socket.
 *
 * @argument socket The socket to pipe data on.
 */
class Terminal {
  private terminal: pty.IPty = null;
  private socket: socketio.Socket;

  constructor(socket: socketio.Socket, homeDirectory?: string) {
    this.socket = socket;
    this.terminal = pty.spawn(SHELL, [], {
      name: "xterm-color",
      // We need SystemRoot in the case of windows and powershell. Simplest
      // solution is to symply pick it from current environment if it exists.
      env: pick(process.env, ["SystemRoot", "PS1"]),
      cwd: homeDirectory ? homeDirectory : process.env.HOME
    });

    this.terminal.on("data", function(data) {
      if (socket.rooms["authenticated"]) {
        socket.emit("pty/data", data.toString());
      }
    });

    socket.on("pty/data", this.onPtyData);
    socket.on("pty/resize", this.onPtyResize);
    socket.on("connection/signout", this.kill);
    socket.on("disconnect", this.kill);
  }

  onPtyData = (data: string): void => {
    if (this.socket.rooms["authenticated"]) {
      this.terminal.write(data);
    }
  };

  onPtyResize = (data: TerminalSize): void => {
    if (this.socket.rooms["authenticated"]) {
      if (!data?.columns || !data?.rows) {
        return;
      }
      this.terminal.resize(data.columns, data.rows);
    }
  };

  /**
   * Kill the terminal
   */
  kill = (): void => {
    if (this.terminal !== null) {
      this.terminal.kill();
      this.terminal = null;

      this.socket.off("pty/data", this.onPtyData);
      this.socket.off("pty/resize", this.onPtyResize);
      this.socket.off("connection/signout", this.kill);
      this.socket.off("disconnect", this.kill);
    }
  };
}

export default Terminal;
