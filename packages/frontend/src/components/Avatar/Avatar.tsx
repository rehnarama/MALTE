import * as React from "react";

import classes from "./Avatar.module.css";

export interface Props {
  url?: string;
  name?: string;
}

const Avatar: React.SFC<Props> = props => {
  const { url, name } = props;
  if (url && url.length > 0) {
    return <img className={classes.circle} src={url} alt="Avatar" />;
  } else if (name && name.length >= 1) {
    return (
      <div className={classes.circle}>
        <p className={classes.initials}>{name.substr(0, 1)}</p>
      </div>
    );
  } else {
    return <div className={classes.circle} />;
  }
};
export default Avatar;
