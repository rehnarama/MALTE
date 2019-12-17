export default interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  type: "directory" | "file";
}

export function treeToArray(t: TreeNode | undefined): TreeNode[] {
  if (!t) return [];
  if (t.children) {
    let nodes: TreeNode[] = [];
    for (const child of t.children) {
      nodes = nodes.concat(treeToArray(child));
    }
    return nodes;
  } else {
    return [t];
  }
}
