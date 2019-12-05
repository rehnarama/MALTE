import * as React from "react";
import classes from "./BottomBar.module.css";

const COMMIT_ID: string = process.env.REACT_APP_SOURCE_VERSION
  ? process.env.REACT_APP_SOURCE_VERSION.substr(0, 7)
  : "dev build";

interface Props {
  switchTheme: () => void;
}

const BottomBar: React.FC<Props> = (props: Props) => {
  const { switchTheme } = props;
  return (
    <div className={classes.container}>
      <div className={classes.leftSide}>
        <p>Build: {COMMIT_ID}</p>
      </div>
      <div className={classes.rightSide}>
        <p onClick={switchTheme} className={classes.actionable}>
          💡
        </p>
      </div>
    </div>
  );
};

export default BottomBar;
