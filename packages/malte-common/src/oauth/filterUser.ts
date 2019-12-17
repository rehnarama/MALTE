import { User } from "./GitHub";
import { keys } from "ts-transformer-keys";

export function filterUser(data: User): User {
  const user: User = {};
  const keysOfUser = keys<User>();
  keysOfUser.forEach((k: string | number) => {
    if (data[k]) {
      user[k] = data[k];
    }
  });
  return user;
}
