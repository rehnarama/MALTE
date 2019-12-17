import { User as UserData } from "./oauth/GitHub";

type User = UserData & {socketId: string };
export { User };

export interface UserList {
  users: User[];
}
