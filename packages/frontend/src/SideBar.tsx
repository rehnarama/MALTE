import * as React from "react";
import classes from "./SideBar.module.css";

const SideBar: React.FC = () => {
    return (
        <div>
            <div>
                <p className={classes.red}>SideBar</p>
            </div>
        </div>
    );
}

export default SideBar;