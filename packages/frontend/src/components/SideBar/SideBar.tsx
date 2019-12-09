import * as React from "react";
import TreeNode, { treeToArray } from "malte-common/dist/TreeNode";
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
  activeFileName: string;
  changeActiveFileName: (newName: string) => void;
  removeFile: (newName: string) => void;
  signOut: () => void;
}

class SideBar extends React.Component<Props, State> {
  private socket: SocketIOClient.Socket;

  constructor(props: Props) {
    super(props);
    this.socket = Socket.getInstance().getSocket();
    this.state = { toggledKeys: {} };
    this.socket.on("file/tree", this.onFileTree);
  }

  onFileTree = (data: TreeNode) => {
    const oldData = treeToArray(this.state.data);
    const newData = treeToArray(data);

    const removedFiles = oldData.filter(
      oldNode => 0 > newData.findIndex(newNode => oldNode.path === newNode.path)
    );

    if (removedFiles.length === 1) {
      // Assuming that only one file can be removed per update
      this.props.removeFile(removedFiles[0].path);
    }

    this.setState(({ toggledKeys }) => ({
      data,
      // Set root to automatically expanded unless the user has previously set
      // it to collapsed
      toggledKeys: Object.assign({ [data.path]: true }, toggledKeys)
    }));
  };

  componentDidMount() {
    this.socket.emit("file/tree-refresh");
  }

  componentWillUnmount() {
    this.socket.removeListener("file/tree", this.onFileTree);
  }

  onSelect = (node: TreeNode) => {
    this.props.changeActiveFileName(node.path);
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
    this.props.removeFile(node.path);
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
              selected={this.props.activeFileName}
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
  const {
    activeFileName,
    changeActiveFileName,
    removeFile
  } = useFileNameContext();

  return (
    <SideBar
      activeFileName={activeFileName}
      changeActiveFileName={changeActiveFileName}
      removeFile={removeFile}
      signOut={props.signOut}
    />
  );
};

export default SideBarWithFileName;
