import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import { Operation } from "malte-common/dist/FileSystem";
import Tree from "../Tree";
import Socket from "../../functions/Socket";
import classes from "./SideBar.module.css";
import { useFileNameContext } from "../../context/FileNameContext";
import { Button } from "@material-ui/core";
import SignOutIcon from "@material-ui/icons/PowerSettingsNew";

interface State {
  data?: TreeNode;
  toggledKeys: { [key: string]: boolean };
}

interface Props {
  fileName: string;
  setFileName: (newName: string) => void;
  signOut: () => void;
}

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
    this.props.setFileName(node.path);
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
        <div className={classes.fileTree}>
          <p>Files</p>
          {this.state.data ? (
            <Tree
              node={this.state.data}
              root
              selected={this.props.fileName}
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
        </div>
        <div className={classes.signOut}>
          <Button fullWidth variant={"outlined"} onClick={this.props.signOut}>
            <SignOutIcon />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }
}

interface ExternalProp {
  signOut: () => void;
}

const SideBarWithFileName = (props: ExternalProp) => {
  const { fileName, changeFileName } = useFileNameContext();

  return (
    <SideBar
      fileName={fileName}
      setFileName={changeFileName}
      signOut={props.signOut}
    />
  );
};

export default SideBarWithFileName;
