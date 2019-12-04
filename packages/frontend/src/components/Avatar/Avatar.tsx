import * as React from "react";
import classes from "./Avatar.module.css";
import { Tooltip } from "@material-ui/core";

export interface Props {
  url?: string;
  name?: string;
}

const Avatar: React.SFC<Props> = props => {
  const { url, name } = props;
  if (url && url.length > 0) {
    return (
      <Tooltip
        title={name}
        PopperProps={{
          popperOptions: {
            modifiers: {
              offset: {
                enabled: true,
                offset: "18px, 0px"
              }
            }
          }
        }}
      >
        <img className={classes.circle} src={url} alt="Avatar" />
      </Tooltip>
    );
  } else {
    return <div className={classes.circle} />;
  }
};
export default Avatar;
