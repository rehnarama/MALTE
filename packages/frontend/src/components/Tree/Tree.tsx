import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import classes from "./Tree.module.css";

interface Props {
  node: TreeNode;
  root?: boolean;
  toggledKeys: { [key: string]: boolean };
  onSelect?: (node: TreeNode) => void;
  onToggle?: (node: TreeNode) => void;
}

const Tree: React.SFC<Props> = props => {
  const { node, root, toggledKeys, onSelect, onToggle } = props;
  const isToggled = toggledKeys[node.path] === true;

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

  const content = (
    <li>
      <p onClick={onClick}>
        {node.type === "directory" && isToggled && <span>▼&nbsp;</span>}
        {node.type === "directory" && !isToggled && <span>▶&nbsp;</span>}
        {node.name}
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
