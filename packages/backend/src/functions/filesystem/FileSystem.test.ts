import "mocha";
import { assert } from "chai";
import os from "os";
import { promises as fs } from "fs";
import path, { sep } from "path";
import FileSystem from "./FileSystem";
import MockedSocket from "socket.io-mock";
import { FileOperation, Operation } from "malte-common/dist/FileSystem";

describe("FileSystems", () => {
  const tmpDir = os.tmpdir();

  it("should work correctly in simple case one level case", async () => {
    const tmpProjectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
    console.log(tmpProjectRoot);
    const fileSystems: FileSystem = new FileSystem(
      new MockedSocket(),
      tmpProjectRoot
    );

    assert.isTrue(await fileSystems.createDirectory("./", "test"));
    assert.isTrue(await fileSystems.createDirectory("/test", "testsub"));
    assert.isFalse(await fileSystems.createDirectory("..../", ""));

    await fs.rmdir(tmpProjectRoot, { recursive: true });
  });
});
