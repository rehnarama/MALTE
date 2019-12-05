import * as React from "react";
import classes from "./WelcomeScreen.module.css";

const WelcomeScreen: React.FC = () => {
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <p>Welcome to MALTE!</p>
      </div>
      <div>
        <p>Please select a file to the left to get started!</p>
      </div>
    </div>
  );
};
export default WelcomeScreen;
