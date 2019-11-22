import * as React from "react";
import User from "../../functions/User";
import classes from "./TopBar.module.css";

const TopBar: React.SFC = () => {
  const [loading, setLoading] = React.useState(true);
  const [needAuthentication, setNeedAuthentication] = React.useState(false);
  React.useEffect(() => {
    async function fetch() {
      try {
        await User.fetchUser();
      } catch (err) {
        console.error(err);
        // Most likely failed due to needing authentication
        setNeedAuthentication(true);
      }
      setLoading(false);
    }

    if (!User.hasUser()) {
      fetch();
    }
  }, []);

  return (
    <header className={classes.container}>
      <h1>MALTE</h1>

      {User.hasUser() && JSON.stringify(User.getUser())}
      {loading && <p>Loading user...</p>}
      {needAuthentication && (
        <button onClick={User.authenticate}>Login with GitHub</button>
      )}
    </header>
  );
};
export default TopBar;
