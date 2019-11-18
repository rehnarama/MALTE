import * as React from "react";
import classes from "./SideBar.module.css";
import {Treebeard, TreeNode} from "react-treebeard";

// example JSON 
const data = {
    name: 'root',
    children: [
        {
            name: 'folder1',
            type: 'directory',
            path: 'root',
            children: [
                {
                    name: 'file1.js', 
                    type: 'file',
                    path: 'root/folder1/file1.js'
                },
                { name: 'file2.js', type: 'file' }
            ]
        },
        {
            name: 'folder2',
            type: 'directory',
            children: [
                { name: 'file1.js', type: 'file' },
                { name: 'file2.js', type: 'file' }
            ]
        },
        {
            name: 'folder3',
            type: 'directory',
            children: [
                {
                    name: 'folder4',
                    type: 'directory',
                    children: [
                        { name: 'file1.js', type: 'file' },
                        { name: 'file2.js', type: 'file' }
                    ]
                },
                {
                    name: 'folder5',
                    type: 'directory',
                    children: [
                        { name: 'file1.js', type: 'file' },
                        { name: 'file2.js', type: 'file' }
                    ]
                }
            ]
        }
    ]
};

interface State {
    data: TreeNode | Array<TreeNode>;
    active?: boolean;
}
interface Props {}

class SideBar extends React.Component<Props,State> {
    constructor(props: Props) {
        super(props);
        this.state = {data};
    }

    onToggle = (node: TreeNode, toggled:boolean) => {
        const {data} = this.state;
    
        if (node) {
            if(node.type === 'file') {
                /*This will later be used by CodeEditor to open the specific file */
                console.log(JSON.stringify(node.path));
            }
            this.setState(() => ({active: false}));
        }

        if (node.children) { 
            node.toggled = toggled; 
        }

        this.setState(() => ({data: Object.assign({}, data)}));
    }

    render() {
        return (
            <div>
                <p className={classes.red}>SideBar</p>
                <Treebeard
                    data={this.state.data}
                    onToggle={this.onToggle}
                />`
            </div>
        );
    }
}

export default SideBar;
