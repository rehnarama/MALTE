import "mocha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import os from "os";
import { promises as fs } from "fs";
import path, { sep } from "path";
import FileSystem from "./FileSystem";
import MockedSocket from "socket.io-mock";

const assert = chai.assert;
chai.use(chaiAsPromised);

describe("FileSystems API", () => {
  const tmpDir = os.tmpdir();

  it("should create folders according to specification", async () => {
    const tmpProjectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
    const fileSystems: FileSystem = new FileSystem(
      new MockedSocket(),
      tmpProjectRoot
    );
    assert.isTrue(
      await fileSystems.createDirectory(FileSystem.getWorkspaceRoot(), "test")
    );
    assert.isTrue(await fileSystems.createDirectory("/test", "testsub"));

    try {
      await fs.readdir(path.join(tmpProjectRoot, "test"));
      assert(true);
    } catch (err) {
      assert(false);
    }

    try {
      await fs.readdir(path.join(tmpProjectRoot, "test", "testsub"));
      assert(true);
    } catch (err) {
      assert(false);
    }
    fs.rmdir(tmpProjectRoot, { recursive: true });
  });

  it("should touch/create files according to specification", async () => {
    const tmpProjectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
    const fileSystems: FileSystem = new FileSystem(
      new MockedSocket(),
      tmpProjectRoot
    );
    try {
      assert.isTrue(
        await fileSystems.createFile(FileSystem.getWorkspaceRoot(), "my_file1")
      );
      assert.isTrue(
        await fileSystems.createFile(FileSystem.getWorkspaceRoot(), "my_file1")
      ); // Should not crash if file already exists
      assert(true);
    } catch (err) {
      assert(false);
    }
    try {
      assert.isTrue(
        await fileSystems.createDirectory(FileSystem.getWorkspaceRoot(), "test")
      );
      assert(true);
    } catch (err) {
      assert(false);
    }
    fs.rmdir(tmpProjectRoot, { recursive: true });
  });

  it("should remove files/folders according to specification", async () => {
    const tmpProjectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
    const fileSystems: FileSystem = new FileSystem(
      new MockedSocket(),
      tmpProjectRoot
    );
    assert.isTrue(
      await fileSystems.createFile(FileSystem.getWorkspaceRoot(), "my_file1")
    );
    try {
      await fs.readFile(path.join(tmpProjectRoot, "my_file1"));
      assert(true);
    } catch (err) {
      assert(false);
    }

    assert.isTrue(
      await fileSystems.remove(FileSystem.getWorkspaceRoot(), "my_file1")
    );
    try {
      await fs.readFile(path.join(tmpProjectRoot, "my_file1"));
      assert(false);
    } catch (err) {
      assert(true);
    }

    assert.isTrue(
      await fileSystems.createDirectory(FileSystem.getWorkspaceRoot(), "test")
    );
    assert.isTrue(await fileSystems.createDirectory("/test", "testsub"));
    try {
      await fs.readdir(path.join(tmpProjectRoot, "test", "testsub"));
      assert(true);
    } catch (err) {
      console.log(err);
      assert(false);
    }

    fs.rmdir(tmpProjectRoot, { recursive: true });
  });

  it("should rename or move files/folders according to specification", async () => {
    const tmpProjectRoot = await fs.mkdtemp(`${tmpDir}${sep}`);
    const fileSystems: FileSystem = new FileSystem(
      new MockedSocket(),
      tmpProjectRoot
    );
    assert.isTrue(
      await fileSystems.createFile(FileSystem.getWorkspaceRoot(), "my_file1")
    );
    try {
      await fs.readFile(path.join(tmpProjectRoot, "my_file1"));
      assert(true);
    } catch (err) {
      assert(false);
    }

    assert.isTrue(
      await fileSystems.move(FileSystem.getWorkspaceRoot(), "my_file1")
    );
    try {
      await fs.readFile(path.join(tmpProjectRoot, "my_file1"));
      assert(false);
    } catch (err) {
      assert(true);
    }

    assert.isTrue(
      await fileSystems.move(
        FileSystem.getWorkspaceRoot(),
        "my_file1",
        "my_new_cool_file"
      )
    );
    try {
      await fs.readFile(path.join(tmpProjectRoot, "my_new_cool_file"));
      assert(false);
    } catch (err) {
      assert(true);
    }
    await fileSystems.createDirectory(FileSystem.getWorkspaceRoot(), "test");
    await fileSystems.createFile("/test", "my_file1");

    assert.isTrue(
      await fileSystems.move(
        FileSystem.getWorkspaceRoot(),
        "test",
        "my_new_cool_folder"
      )
    );
    try {
      await fs.readdir(path.join(tmpProjectRoot, "new_cool_folder"));
      assert(false);
    } catch (err) {
      assert(true);
    }

    assert.isTrue(
      await fileSystems.move(
        "my_new_cool_folder",
        "my_file1",
        "new_cool_file_in_cool_folder"
      )
    );
    try {
      await fs.readFile(
        path.join(
          tmpProjectRoot,
          "new_cool_folder",
          "new_cool_file_in_cool_folder"
        )
      );
      assert(false);
    } catch (err) {
      assert(true);
    }
    fs.rmdir(tmpProjectRoot, { recursive: true });
  });
});
