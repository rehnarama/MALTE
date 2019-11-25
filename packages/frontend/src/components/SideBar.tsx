import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import Tree from "./Tree";
import Socket from "../functions/Socket";

interface State {
  data?: TreeNode;
  toggledKeys: { [key: string]: boolean };
}

class SideBar extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    const socket = Socket.getInstance().getSocket();
    this.state = { toggledKeys: {} };
    socket.on("file-tree", this.onFileTree);
  }

  onFileTree = (data: TreeNode) => {
    this.setState(() => ({ data }));
  };

  componentDidMount() {
    Socket.getInstance()
      .getSocket()
      .emit("refresh-file-tree");
  }

  componentWillUnmount() {
    Socket.getInstance()
      .getSocket()
      .removeListener("file-tree", this.onFileTree);
  }

  onSelect = (node: TreeNode) => {
    console.log("select", node);
  };

  onToggle = (node: TreeNode) => {
    console.log("toggle");
    const isToggled = this.state.toggledKeys[node.path] === true;
    const newToggledKeys = Object.assign({}, this.state.toggledKeys, {
      [node.path]: !isToggled
    });
    this.setState({ toggledKeys: newToggledKeys });
  };

  onHover = (node: TreeNode) => {
    console.log("hover", node);
  };

  render() {
    return (
      <div>
        <p>Files</p>
        {this.state.data ? (
          <Tree
            node={this.state.data}
            root
            toggledKeys={this.state.toggledKeys}
            onSelect={this.onSelect}
            onToggle={this.onToggle}
            onHover={this.onHover}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
}

export default SideBar;
