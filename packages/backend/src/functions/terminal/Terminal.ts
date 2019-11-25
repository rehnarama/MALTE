import * as pty from "node-pty";
import socketio from "socket.io";

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
      socket.emit("pty-data", data.toString());
    });

    socket.on("pty-data", data => {
      this.terminal.write(data);
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
