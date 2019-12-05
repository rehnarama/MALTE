import * as React from "react";
import Login from "./Login";
import Main from "./Main";
import { useFileNameContext } from "../context/FileNameContext";
import useAuthenticationStatus from "../hooks/useAuthenticationStatus";
import { AuthenticationStatus } from "../functions/AuthenticationStatus";

const App: React.FC = () => {
  const authenticationStatus = useAuthenticationStatus();

  return (
    <div>
      {authenticationStatus === AuthenticationStatus.Authenticated ? (
        <useFileNameContext.Provider>
          <Main />
        </useFileNameContext.Provider>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
