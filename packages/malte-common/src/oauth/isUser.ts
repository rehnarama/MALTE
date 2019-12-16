import { User } from "./GitHub";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUser(arg: any): arg is User {
  return (
    arg?.login &&
    typeof arg.login == "string" &&
    arg?.id &&
    typeof arg.id == "number" &&
    arg?.avatar_url &&
    typeof arg.avatar_url == "string" &&
    arg?.url &&
    typeof arg.url == "string"
  );
}
