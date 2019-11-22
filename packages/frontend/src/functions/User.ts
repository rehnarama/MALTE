import { User as UserData } from "malte-common/dist/oauth/GitHub";

export default class User {
  private static user: UserData | null = null;

  public static hasUser() {
    return User.user !== null;
  }

  public static async fetchUser() {
    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/oauth/github/user`,
      {
        method: "GET",
        credentials: "include",
        mode: "cors"
      }
    );
    if (res.ok) {
      const user = (await res.json()) as UserData;
      User.user = user;
    } else {
      throw new Error(`Couldn't fetch user, reason: ${await res.json()}`);
    }
  }

  public static async authenticate() {
    window.location.replace(
      `${process.env.REACT_APP_BACKEND_URL}/oauth/github/auth`
    );
  }

  public static getUser() {
    return User.user;
  }
}
