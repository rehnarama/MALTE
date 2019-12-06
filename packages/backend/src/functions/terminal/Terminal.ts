import * as pty from "node-pty";
import socketio from "socket.io";
import TerminalSize from "malte-common/dist/Terminal";

const SHELL = process.platform === "win32" ? "powershell.exe" : "bash";

/**
 * Create a pseudo-terminal and pipe the std-out/in to
 * a socket.
 *
 * @argument socket The socket to pipe data on.
 */
class Terminal {
  private terminal: pty.IPty;

  constructor(socket: socketio.Socket, homeDirectory?: string) {
    this.terminal = pty.spawn(SHELL, [], {
      name: "xterm-color",
      env: process.env,
      cwd: homeDirectory ? homeDirectory : process.env.HOME
    });

    this.terminal.on("data", function(data) {
      if (socket.rooms["authenticated"]) {
        socket.emit("pty-data", data.toString());
      }
    });

    socket.on("pty-data", data => {
      if (socket.rooms["authenticated"]) {
        this.terminal.write(data);
      }
    });

    socket.on("pty-resize", (data: TerminalSize) => {
      if (!data?.columns || !data?.rows) {
        return;
      }
      this.terminal.resize(data.columns, data.rows);
    });

    socket.on("connection/signout", () => {
      this.terminal.kill();
    });

    socket.on("disconnect", () => {
      this.kill();
    });
  }

  /**
   * Kill the terminal
   */
  public kill(): void {
    this.terminal.kill();
  }
}

export default Terminal;
