import "mocha";
import { assert } from "chai";
import MockSocketUnTyped from "socket.io-mock";
import mock from "mock-fs";
import File from "./File";
import fs from "fs";
import RGA from "rga/dist/RGA";

describe("File", function() {
  this.beforeEach(() => {
    mock({
      "fake/dir/file.js": 'console.log("Hello World");'
    });
  });

  it("should initialize with existing file", async () => {
    const file = new File("fake/dir/file.js");
    await file.initialize();
    assert.equal(file.getContent().toString(), 'console.log("Hello World");');
  });

  it("should initialize with non-existing file", async () => {
    const file = new File("fake/dir/nope.js");
    await file.initialize();
    assert.equal(file.getContent().toString(), "");
    assert(fs.existsSync("fake/dir/nope.js"));
  });

  it("should allow a socket to join", () => {
    const file = new File("fake/dir/file.js");
    file.initialize();
    const socket = new MockSocketUnTyped();
    const success = file.join(socket);
    assert(success);
  });

  this.afterEach(() => {
    mock.restore();
  });
});
