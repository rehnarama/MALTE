import * as React from "react";
import TreeNode from "malte-common/dist/TreeNode";
import classes from "./Tree.module.css";
import filesvg from "./file.svg";
import foldersvg from "./folder.svg";
import deletesvg from "./delete.svg";
import editsvg from "./edit.svg";

interface IconsProps {
  node: TreeNode;
  parent?: TreeNode;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
  onEdit?: () => void;
}

const Icons: React.SFC<IconsProps> = props => {
  const {
    node,
    parent,
    onCreateFile,
    onCreateFolder,
    onDelete,
    onEdit
  } = props;

  const elems: React.ReactNode[] = [];

  // Detect if an icon is clicked and call the correspoding function in Tree component
  const deleteNode: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const createFolder: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (onCreateFolder) {
      onCreateFolder();
    }
  };

  const createFile: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (onCreateFile) {
      onCreateFile();
    }
  };

  const editNode: React.MouseEventHandler = e => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  if (node.type === "directory") {
    elems.push(
      <img key="file" src={filesvg} onClick={createFile} alt="Create File" />
    );
    elems.push(
      <img
        key="folder"
        src={foldersvg}
        onClick={createFolder}
        alt="Create Folder"
      />
    );
    if (node.children && node.children.length === 0 && parent !== undefined) {
      elems.push(
        <img key="delete" src={deletesvg} onClick={deleteNode} alt="Delete" />
      );
    }
  } else {
    elems.push(
      <img key="delete" src={deletesvg} onClick={deleteNode} alt="Delete" />
    );
  }
  if (parent) {
    elems.push(
      <img key="edit" src={editsvg} onClick={editNode} alt="Rename" />
    );
  }

  return <>{elems}</>;
};

interface TreeProps {
  node: TreeNode;
  parent?: TreeNode;
  root?: boolean;
  toggledKeys: { [key: string]: boolean };
  onSelect?: (node: TreeNode) => void;
  onToggle?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode, parent: TreeNode) => void;
  onCreateFile?: (node: TreeNode, name: string) => void;
  onCreateFolder?: (node: TreeNode, name: string) => void;
  onEdit?: (node: TreeNode, parent: TreeNode, name: string) => void;
  selected: string;
}

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
    onCreateFolder,
    onEdit,
    selected
  } = props;

  const isToggled = toggledKeys[node.path] === true;
  const [isHover, setIsHover] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [fileName, setFileName] = React.useState("");

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

  const handleFileNameChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(e => {
    setFileName(e.currentTarget.value);
  }, []);

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler>(
    e => {
      if (e.key === "Enter") {
        if (isCreating === "file" && onCreateFile) {
          setIsCreating("");
          onCreateFile(node, fileName);
        } else if (isCreating === "folder" && onCreateFolder) {
          setIsCreating("");
          onCreateFolder(node, fileName);
        } else if (isEditing && onEdit && parent !== undefined) {
          setIsEditing(false);
          onEdit(node, parent, fileName);
        }
        setFileName("");
      } else if (e.key === "Escape") {
        setIsCreating("");
        setIsEditing(false);
        setFileName("");
      }
    },
    [
      fileName,
      node,
      parent,
      onEdit,
      isCreating,
      isEditing,
      onCreateFile,
      onCreateFolder
    ]
  );

  const deleteNode = () => {
    if (parent !== undefined && onDelete) {
      onDelete(node, parent);
    }
  };

  const content = (
    <li>
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={
          selected === node.path
            ? `${classes.item} ${classes.selected}`
            : classes.item
        }
      >
        <div className={classes.name}>
          {node.type === "directory" && isToggled && <span>▼&nbsp;</span>}
          {node.type === "directory" && !isToggled && <span>▶&nbsp;</span>}
          {isEditing ? (
            <input
              type="text"
              autoFocus
              onBlur={() => setIsEditing(false)}
              onKeyDown={handleKeyDown}
              onChange={handleFileNameChange}
              placeholder={node.name}
              value={fileName}
            />
          ) : (
            node.name
          )}
        </div>

        {isHover && (
          <div>
            <Icons
              node={node}
              parent={parent}
              onDelete={deleteNode}
              onCreateFile={() => setIsCreating("file")}
              onCreateFolder={() => setIsCreating("folder")}
              onEdit={() => setIsEditing(true)}
            ></Icons>
          </div>
        )}
      </div>
      <ul className={classes.list}>
        {isCreating && (
          <input
            type="text"
            autoFocus
            onBlur={() => setIsCreating("")}
            onKeyDown={handleKeyDown}
            onChange={handleFileNameChange}
            value={fileName}
          />
        )}
        {node.children &&
          isToggled &&
          node.children
            .sort((c1, c2) => {
              if (c1.type === "directory" && c2.type !== "directory") return -1;
              else if (c1.type !== "directory" && c2.type === "directory")
                return 1;
              else return 0;
            })
            .map(child => (
              <Tree
                key={child.path}
                node={child}
                selected={selected}
                parent={node}
                toggledKeys={toggledKeys}
                onSelect={onSelect}
                onToggle={onToggle}
                onDelete={onDelete}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                onEdit={onEdit}
              />
            ))}
      </ul>
    </li>
  );
  if (root) {
    return <ul className={classes.list + " " + classes.root}>{content}</ul>;
  } else {
    return content;
  }
};

export default Tree;
