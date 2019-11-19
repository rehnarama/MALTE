import { promises as fs } from "fs";
import path from "path";
import TreeNode from "malte-common/dist/TreeNode";

/**
 * fsTree Generates a JSON tree of the file system
 * @argument root The root of the tree
 * @argument depth How many levels of recursion of folders to go through.
 *           Infinity for an infinite amount of recursion
 */
export default async function fsTree(
  root: string,
  depth = Infinity
): Promise<TreeNode> {
  const stats = await fs.lstat(root);

  if (stats.isFile()) {
    return {
      name: path.basename(root),
      path: path.resolve(root),
      type: "file"
    };
  } else if (stats.isDirectory()) {
    const suburls = await fs.readdir(root);
    const obj: TreeNode = {
      name: path.basename(root),
      path: path.resolve(root),
      type: "directory"
    };

    if (depth > 0) {
      obj.children = await Promise.all(
        suburls.map(
          async suburl => await fsTree(path.join(root, suburl), depth - 1)
        )
      );
    }

    return obj;
  }
}
