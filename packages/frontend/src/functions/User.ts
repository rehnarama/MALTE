import { User as UserData } from "malte-common/dist/oauth/GitHub";
import { getBackendUrl } from "../functions/Environment";

export default class User {
  private static user: UserData | null = null;

  public static hasUser() {
    return User.user !== null;
  }

  public static async fetchUser(): Promise<
    "success" | "unauthorized" | string
  > {
    const res = await fetch(`${getBackendUrl()}/oauth/github/user`, {
      method: "GET",
      credentials: "include",
      mode: "cors"
    });
    if (res.ok) {
      const user = (await res.json()) as UserData;
      User.user = user;
      return "success";
    } else if (res.status === 401) {
      return "unauthorized";
    } else {
      // Unknown error
      return await res.text();
    }
  }

  /**
   * authenticate
   * @returns true if successfully authenticated against GitHub, false otherwise
   */
  public static async authenticate(): Promise<boolean> {
    const w = window.open(
      `${getBackendUrl()}/oauth/github/auth`,
      "Login with GitHub",
      "chrome=yes,centerscreen,width=800,height=800"
    );
    return new Promise<boolean>(resolve => {
      // We need to poll to check if closed since it is no onclose event
      // is only allowed with same-origin, which is not guaranteed
      async function checkIfClosed() {
        if (w === null) {
          resolve(false);
        } else if (w.closed) {
          // Window is closed which means either
          // 1. auth completed and we can fetch user
          // 2. the user aborted authentication
          const status = await User.fetchUser();
          if (status === "success") {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          // Wait for 200ms to check if closed again
          setTimeout(checkIfClosed, 200);
        }
      }
      checkIfClosed();
    });
  }

  public static getUser() {
    return User.user;
  }
}
