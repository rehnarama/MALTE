import * as React from "react";
import User from "../../functions/User";
import classes from "./Login.module.css";
import { Button } from "@material-ui/core";
import githubLogo from "./githubLogo.svg";
import dog from "./dog.jpg";
import useAuthenticationStatus from "../../hooks/useAuthenticationStatus";
import { AuthenticationStatus } from "../../functions/Socket";
import CircularProgress from "@material-ui/core/CircularProgress";

const Login: React.FC = () => {
  const authenticationStatus = useAuthenticationStatus();

  async function authenticate() {
    await User.authenticate();
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
        {authenticationStatus === AuthenticationStatus.Unknown && (
          <CircularProgress />
        )}
        {(authenticationStatus === AuthenticationStatus.Failed ||
          authenticationStatus === AuthenticationStatus.Unauthenticated) && (
          <Button variant="contained" onClick={authenticate}>
            Login with GitHub
            <img className={classes.logo} src={githubLogo} alt="Github Logo" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Login;
