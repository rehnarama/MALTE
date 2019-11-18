import "mocha"
import Terminal from "./Terminal"
import MockedSocket from "socket.io-mock"

describe("Terminal class", function() {
    it("should terminate graceful", () => {
        const terminal = new Terminal(new MockedSocket())
        terminal.kill()
    })
})
