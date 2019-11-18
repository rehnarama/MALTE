import * as pty from "node-pty"
import socketio from "socket.io";

class Terminal {
    private terminal: pty.IPty

    constructor(socket: socketio.Socket) {
        this.terminal = pty.spawn("bash", [], {
            name: "xterm-color",
            env: process.env,
            cwd: process.env.HOME
        })
        
        this.terminal.on("data", function (data) {
            socket.emit("pty-data", data.toString());
        })
        
        socket.on("pty-data", (data) => {
            this.terminal.write(data)
        })        
    }
}

export default Terminal
