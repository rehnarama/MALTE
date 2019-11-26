import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import classes from "./Tree.module.css";
import filesvg from "./file.svg";
import foldersvg from "./folder.svg";
import deletesvg from "./delete.svg";

interface TreeProps {
  node: TreeNode;
  parent?: TreeNode;
  root?: boolean;
  toggledKeys: { [key: string]: boolean };
  onSelect?: (node: TreeNode) => void;
  onToggle?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode, parent: TreeNode) => void;
  onCreateFile?: (node: TreeNode) => void;
  onCreateFolder?: (node: TreeNode) => void;
}

interface IconsProps {
  node: TreeNode;
  parent?: TreeNode;
  onDelete?: (node: TreeNode, parent: TreeNode) => void;
  onCreateFile?: (node: TreeNode) => void;
  onCreateFolder?: (node: TreeNode) => void;
}

const Icons: React.SFC<IconsProps> = props => {
  const { node, parent, onCreateFile, onDelete, onCreateFolder } = props;
  const elems: React.ReactNode[] = [];

  const deleteNode: React.MouseEventHandler = e => {
    e.stopPropagation();
    if(parent) {
    if (onDelete) {
      onDelete(node, parent);
    }

    }
  };

  const createFolder: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (onCreateFolder) {
      onCreateFolder(node);
    }
  };

  const createFile: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (onCreateFile) {
      onCreateFile(node);
    }
  };

  if (node.type === "directory") {
    elems.push(<img key="file" src={filesvg} onClick={createFile} />);
    elems.push(<img key="folder" src={foldersvg} onClick={createFolder} />);
    if (node.children && node.children.length === 0) {
      elems.push(<img key="delete" src={deletesvg} onClick={deleteNode} />);
    }
  } else {
    elems.push(<img key="delete" src={deletesvg} onClick={deleteNode} />);
  }
  return <>{elems}</>;
};

const Tree: React.SFC<TreeProps> = props => {
  const {
    node,
    parent,
    root,
    toggledKeys,
    onSelect,
    onToggle,
    onDelete,
    onCreateFile,
    onCreateFolder
  } = props;
  const isToggled = toggledKeys[node.path] === true;

  const [isHover, setIsHover] = React.useState(false);

  const onClick = React.useCallback<React.MouseEventHandler>(
    e => {
      e.stopPropagation();
      if (node.type === "directory" && onToggle) {
        onToggle(node);
      } else if (node.type === "file" && onSelect) {
        onSelect(node);
      }
    },
    [node, onToggle, onSelect]
  );

  const onMouseEnter = () => {
    setIsHover(true);
  };

  const onMouseLeave = () => {
    setIsHover(false);
  };

  const content = (
    <li>
      <p
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {node.type === "directory" && isToggled && <span>▼&nbsp;</span>}
        {node.type === "directory" && !isToggled && <span>▶&nbsp;</span>}
        {node.name}
        {isHover && (
          <Icons
            node={node}
            parent={parent}
            onDelete={onDelete}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
          ></Icons>
        )}
      </p>
      {node.children && isToggled && (
        <ul className={classes.list}>
          {node.children.map(child => (
            <Tree
              key={child.path}
              node={child}
              parent={node}
              toggledKeys={toggledKeys}
              onSelect={onSelect}
              onToggle={onToggle}
              onDelete={onDelete}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          ))}
        </ul>
      )}
    </li>
  );
  if (root) {
    return <ul className={classes.list}>{content}</ul>;
  } else {
    return content;
  }
};

export default Tree;
