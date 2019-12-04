import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import { Operation } from "malte-common/dist/FileSystem";
import Tree from "../Tree";
import Socket from "../../functions/Socket";
import useFilename from "../../hooks/useFilename";
import classes from "./SideBar.module.css";

interface State {
  data?: TreeNode;
  toggledKeys: { [key: string]: boolean };
}

interface Props {
  selectedFile: string;
}

const COMMIT_ID: string = process.env.REACT_APP_SOURCE_VERSION
  ? process.env.REACT_APP_SOURCE_VERSION.substr(0, 8)
  : "development build";

class SideBar extends React.Component<Props, State> {
  private socket: SocketIOClient.Socket;

  constructor(props: Props) {
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
    Socket.getInstance()
      .getSocket()
      .emit("join-buffer", {
        path: node.path
      });
  };

  onToggle = (node: TreeNode) => {
    const isToggled = this.state.toggledKeys[node.path] === true;
    const newToggledKeys = Object.assign({}, this.state.toggledKeys, {
      [node.path]: !isToggled
    });
    this.setState({ toggledKeys: newToggledKeys });
  };

  onDelete = (node: TreeNode, parent: TreeNode) => {
    this.socket.emit("file/operation", {
      operation: Operation.rm,
      dir: parent.path,
      name: node.name
    });
  };

  onCreateFolder = (node: TreeNode, name: string) => {
    this.socket.emit("file/operation", {
      operation: Operation.mkdir,
      dir: node.path,
      name: name
    });
  };

  onCreateFile = (node: TreeNode, name: string) => {
    this.socket.emit("file/operation", {
      operation: Operation.touch,
      dir: node.path,
      name: name
    });
  };

  onEdit = (node: TreeNode, parent: TreeNode, name: string) => {
    this.socket.emit("file/operation", {
      operation: Operation.mv,
      dir: parent.path,
      name: node.name,
      newName: name
    });
  };

  render() {
    return (
      <div className={classes.sideBar}>
        <p>Files</p>
        {this.state.data ? (
          <Tree
            node={this.state.data}
            root
            selected={this.props.selectedFile}
            toggledKeys={this.state.toggledKeys}
            onSelect={this.onSelect}
            onToggle={this.onToggle}
            onDelete={this.onDelete}
            onCreateFolder={this.onCreateFolder}
            onCreateFile={this.onCreateFile}
            onEdit={this.onEdit}
          />
        ) : (
          <p>Loading...</p>
        )}
        <p className={classes.commitId}>Build: {COMMIT_ID}</p>
      </div>
    );
  }
}

const SideBarWithFileName = () => {
  const fileName = useFilename();

  return <SideBar selectedFile={fileName} />;
};

export default SideBarWithFileName;
