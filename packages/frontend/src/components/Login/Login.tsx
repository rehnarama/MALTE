import * as React from "react";
import User from "../../functions/User";
import classes from "./Login.module.css";
import { Button } from "@material-ui/core";
import githubLogo from "./githubLogo.svg";
import dog from "./dog.jpg";

interface Props {
  updateAuthenticatedStatus: () => void;
}

const Login: React.FC<Props> = (props: Props) => {
  const { updateAuthenticatedStatus } = props;

  async function authenticate() {
    const authenticated = await User.authenticate();
    if (authenticated) {
      updateAuthenticatedStatus();
    }
  }
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <p>
          MALTE
          <img src={dog} alt="dog" className={classes.dog} />
        </p>
      </div>
      <div>
        <Button variant="contained" onClick={authenticate}>
          Login with GitHub
          <img className={classes.logo} src={githubLogo} alt="Github Logo" />
        </Button>
      </div>
    </div>
  );
};

export default Login;
