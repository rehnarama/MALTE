export default interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  type: "directory" | "file";
}


