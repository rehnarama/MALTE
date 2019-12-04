import * as React from "react";

import User from "../../functions/User";
import Avatar from "../Avatar";

const UserButton: React.SFC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState(User.getUser());
  const [loading, setLoading] = React.useState(true);
  const [needAuthentication, setNeedAuthentication] = React.useState(false);
  React.useEffect(() => {
    async function fetch() {
      const status = await User.fetchUser();
      if (status === "success") {
        setNeedAuthentication(false);
        setUser(User.getUser());
      } else if (status === "unauthorized") {
        setNeedAuthentication(true);
      } else {
        setNeedAuthentication(false);
        setError(status);
      }
      setLoading(false);
    }

    if (user === null) {
      fetch();
    }
  }, [user]);

  const authenticate = async () => {
    const success = await User.authenticate();
    if (success) {
      setUser(User.getUser());
      setLoading(false);
      setNeedAuthentication(false);
    } else {
      setNeedAuthentication(true);
    }
  };

  if (user) {
    return <Avatar url={user.avatar_url} name={user.login} />;
  } else if (loading) {
    return <p>Loading user...</p>;
  } else if (needAuthentication) {
    return <button onClick={authenticate}>Login with GitHub</button>;
  } else if (error) {
    return <p>Error authenticating with GitHub, reason: {error}</p>;
  } else {
    return <p>Error initialising user button</p>;
  }
};
export default UserButton;
