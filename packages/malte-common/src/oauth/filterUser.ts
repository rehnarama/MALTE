import { User } from "./GitHub";
import { keys } from "ts-transformer-keys";

export function filterUser(data: any) {
  const user: User = {};
  const keysOfUser = keys<User>();
  keysOfUser.forEach(k => {
    if (data[k]) {
      user[k] = data[k];
    }
  });
  return user;
}
