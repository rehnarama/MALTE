import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import FileOperation, { Operation } from "malte-common/dist/FileSystem";
import Tree from "./Tree";
import Socket from "../functions/Socket";
import { pathToFileURL } from "url";

interface State {
  data?: TreeNode;
  toggledKeys: { [key: string]: boolean };
}

class SideBar extends React.Component<{}, State> {
  private socket: SocketIOClient.Socket;

  constructor(props: {}) {
    super(props);
    this.socket = Socket.getInstance().getSocket();
    this.state = { toggledKeys: {} };
    this.socket.on("file-tree", this.onFileTree);
  }

  onFileTree = (data: TreeNode) => {
    this.setState(() => ({ data }));
  };

  componentDidMount() {
    this.socket.emit("refresh-file-tree");
  }

  componentWillUnmount() {
    this.socket.removeListener("file-tree", this.onFileTree);
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

  onDelete = (node: TreeNode, parent?: TreeNode) => {
    if (parent) {
      if (node && node.type === "directory") {
        console.log("sidebar delete folder: ", parent.path, node.name);
        this.socket.emit("file/operation", {
          operation: Operation.rm,
          dir: parent.path,
          name: node.name
        });
      } else if (node && node.type === "file") {
        console.log("sidebar delete file: ", parent.path, node.name);
        this.socket.emit("file/operation", {
          operation: Operation.rm,
          dir: parent.path,
          name: node.name
        });
      }
    }
  }

  onCreateFolder = (node: TreeNode, name: string) => {
    console.log("sidebar create folder: ", node.path, name);
    this.socket.emit("file/operation", {
      operation: Operation.mkdir,
      dir: node.path,
      name: name
    });
  }

  onCreateFile = (node: TreeNode, name: string) => {
    console.log("sidebar create file: ", node.path,  name);
    this.socket.emit("file/operation", {
      operation: Operation.touch,
      dir: node.path,
      name: name
    });
  }

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
            onDelete={this.onDelete}
            onCreateFolder={this.onCreateFolder}
            onCreateFile={this.onCreateFile}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
}

export default SideBar;
