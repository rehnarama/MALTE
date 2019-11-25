import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import classes from "./Tree.module.css";
import filesvg from "./file.svg";
import foldersvg from "./folder.svg";
import deletesvg from "./delete.svg";

interface TreeProps {
  node: TreeNode;
  root?: boolean;
  toggledKeys: { [key: string]: boolean };
  onSelect?: (node: TreeNode) => void;
  onToggle?: (node: TreeNode) => void;
}

interface IconsProps {
  node: TreeNode;
}

const Icons: React.SFC<IconsProps> = props => {
  const { node } = props;
  const elems: React.ReactNode[] = [];

  const deleteNode: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (node.type === "directory") {
      console.log("delete dir: ", node.path);
    } else if (node.type === "file") {
      console.log("delete file: ", node.path);
    }
  };

  const createFolder: React.MouseEventHandler = e => {
    e.stopPropagation();
    console.log("createFolder: ");
  };

  const createFile: React.MouseEventHandler = e => {
    e.stopPropagation();
    console.log("createFile: ");
  };

  if (node.type === "directory") {
    elems.push(<img key="file" src={filesvg} onClick={createFile} />);
    elems.push(<img key="folder" src={foldersvg} onClick={createFolder} />);
    if (node.children && node.children.length === 0) {
      elems.push(
        <img key="delete" src={deletesvg} onClick={deleteNode} />
      );
    }
  } else {
    elems.push(
      <img key="delete" src={deletesvg} onClick={deleteNode} />
    );
  }
  return <>{elems}</>;
};

const Tree: React.SFC<TreeProps> = props => {
  const { node, root, toggledKeys, onSelect, onToggle } = props;
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
    [node]
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
        {isHover && <Icons node={node}></Icons>}
      </p>
      {node.children && isToggled && (
        <ul className={classes.list}>
          {node.children.map(child => (
            <Tree
              key={child.path}
              node={child}
              toggledKeys={toggledKeys}
              onSelect={onSelect}
              onToggle={onToggle}
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
