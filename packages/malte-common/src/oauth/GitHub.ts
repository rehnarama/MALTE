// NOTE: There contains more fields (see https://developer.github.com/v3/users/)
// If needed, these can be added at a later time
export interface User {
  login?: string;
  id?: number;
  avatar_url?: string;
  url?: string;
  socketId?: string

  [propName: string]: string | number | undefined;
}
