import * as React from "react";
import classes from "./SideBar.module.css";
import TreeNode from "malte-common/dist/TreeNode";
import Tree from "./Tree/Tree";

// example JSON
const data: TreeNode = {
  name: "root",
  type: "directory",
  path: "/tmp/root",
  children: [
    {
      name: "folder1",
      type: "directory",
      path: "root",
      children: [
        {
          name: "file1.js",
          type: "file",
          path: "root/folder1/file1.js"
        },
        { name: "file2.js", type: "file", path: "root/folder1/file2.js" }
      ]
    },
    {
      name: "file1.js",
      type: "file",
      path: "root/file1.js"
    },
    { name: "file2.js", type: "file", path: "root/file2.js" }
  ]
};

interface State {
  data: TreeNode;
  toggledKeys: { [key: string]: boolean };
}

class SideBar extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { data, toggledKeys: {} };
  }

  onSelect = (node: TreeNode) => {
    console.log("select", node);
  };
  onToggle = (node: TreeNode) => {
    const isToggled = this.state.toggledKeys[node.path] === true;
    const newToggledKeys = Object.assign({}, this.state.toggledKeys, {
      [node.path]: !isToggled
    });
    this.setState({ toggledKeys: newToggledKeys });
  };

  render() {
    return (
      <div>
        <p>Files</p>
        <Tree
          node={this.state.data}
          root
          toggledKeys={this.state.toggledKeys}
          onSelect={this.onSelect}
          onToggle={this.onToggle}
        />
      </div>
    );
  }
}

export default SideBar;
