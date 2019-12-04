export interface User {
  name: string;
  avatarUrl: string;
  id: number;
}

export interface UserList {
  users: User[];
}
