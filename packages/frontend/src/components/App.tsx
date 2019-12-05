import * as React from "react";
import Login from "./Login";
import Main from "./Main";
import { useCookies } from "react-cookie";
import User from "../functions/User";

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [cookies] = useCookies(["userId"]);

  function updateAuthenticatedStatusTrue() {
    setAuthenticated(true);
    User.authenticateConnection();
  }

  function checkAuthenticatedStatus() {
    if (cookies.userId) {
      setAuthenticated(true);
      User.authenticateConnection();
    }
  }
  return (
    <div>
      {authenticated || cookies.userId ? (
        <Main checkAuthenticatedStatus={checkAuthenticatedStatus} />
      ) : (
        <Login updateAuthenticatedStatus={updateAuthenticatedStatusTrue} />
      )}
    </div>
  );
};

export default App;
