import * as React from "react";

import User from "../../functions/User";
import Avatar from "../Avatar";

const UserButton: React.SFC = () => {
  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [needAuthentication, setNeedAuthentication] = React.useState(false);
  React.useEffect(() => {
    async function fetch() {
      try {
        await User.fetchUser();
        setUser(User.getUser());
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
  if (user) {
    return <Avatar url={user.avatar_url} name={user.name} />;
  } else if (loading) {
    return <p>Loading user...</p>;
  } else if (needAuthentication) {
    return <button onClick={User.authenticate}>Login with GitHub</button>;
  } else {
    return <p>Error initialising user button</p>;
  }
};
export default UserButton;
