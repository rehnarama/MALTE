import * as React from "react";
import classes from "./Avatar.module.css";
import { Tooltip } from "@material-ui/core";

export interface Props {
  url?: string;
  name?: string;
  onSelect?: () => void;
}

const Avatar: React.SFC<Props> = props => {
  const { url, name, onSelect } = props;
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
        <img
          className={classes.circle}
          src={url}
          alt="Avatar"
          onClick={onSelect}
        />
      </Tooltip>
    );
  } else {
    return <div className={classes.circle} />;
  }
};
export default Avatar;
