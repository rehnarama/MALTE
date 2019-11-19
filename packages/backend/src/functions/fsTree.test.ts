import "mocha";
import { assert } from "chai";

import { promises as fs } from "fs";
import os from "os";
import path, { sep } from "path";

import fsTree from "./fsTree";

describe("fsTree", () => {
  const tmpDir = os.tmpdir();
  it("should work correctly in simple case one level case", async () => {
    const dir = await fs.mkdtemp(`${tmpDir}${sep}`);
    await fs.writeFile(path.join(dir, "a"), "");
    await fs.writeFile(path.join(dir, "b"), "");

    assert.deepInclude(await fsTree(dir), {
      name: path.basename(dir),
      path: dir,
      type: "directory",
      children: [
        {
          name: "a",
          path: path.join(dir, "a"),
          type: "file"
        },
        {
          name: "b",
          path: path.join(dir, "b"),
          type: "file"
        }
      ]
    });

    await fs.rmdir(dir, { recursive: true });
  });

  it("should work correctly in simple two level case", async () => {
    const dir = await fs.mkdtemp(`${tmpDir}${sep}`);
    await fs.writeFile(path.join(dir, "a"), "");
    await fs.writeFile(path.join(dir, "b"), "");
    await fs.mkdir(path.join(dir, "c"));
    await fs.writeFile(path.join(dir, "c", "d"), "");

    assert.deepInclude(await fsTree(dir), {
      name: path.basename(dir),
      path: dir,
      type: "directory",
      children: [
        {
          name: "a",
          path: path.join(dir, "a"),
          type: "file"
        },
        {
          name: "b",
          path: path.join(dir, "b"),
          type: "file"
        },
        {
          name: "c",
          path: path.join(dir, "c"),
          type: "directory",
          children: [
            {
              name: "d",
              path: path.join(dir, "c", "d"),
              type: "file"
            }
          ]
        }
      ]
    });

    await fs.rmdir(dir, { recursive: true });
  });

  it("should work limit based on depth parameter", async () => {
    const dir = await fs.mkdtemp(`${tmpDir}${sep}`);
    await fs.writeFile(path.join(dir, "a"), "");
    await fs.writeFile(path.join(dir, "b"), "");
    await fs.mkdir(path.join(dir, "c"));
    await fs.writeFile(path.join(dir, "c", "d"), "");

    assert.deepInclude(await fsTree(dir, 1), {
      name: path.basename(dir),
      path: dir,
      type: "directory",
      children: [
        {
          name: "a",
          path: path.join(dir, "a"),
          type: "file"
        },
        {
          name: "b",
          path: path.join(dir, "b"),
          type: "file"
        },
        {
          name: "c",
          path: path.join(dir, "c"),
          type: "directory"
        }
      ]
    });
    assert.deepInclude(await fsTree(dir, 2), {
      name: path.basename(dir),
      path: dir,
      type: "directory",
      children: [
        {
          name: "a",
          path: path.join(dir, "a"),
          type: "file"
        },
        {
          name: "b",
          path: path.join(dir, "b"),
          type: "file"
        },
        {
          name: "c",
          path: path.join(dir, "c"),
          type: "directory",
          children: [
            {
              name: "d",
              path: path.join(dir, "c", "d"),
              type: "file"
            }
          ]
        }
      ]
    });

    await fs.rmdir(dir, { recursive: true });
  });
});
