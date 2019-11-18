import { spawn, ChildProcessWithoutNullStreams } from "child_process"

class Terminal {
    private terminalPipe: ChildProcessWithoutNullStreams;

    Terminal() {
        this.terminalPipe = spawn('bash');
    }
}

export default Terminal;