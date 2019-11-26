import fetch from "node-fetch";
import { Express, Handler } from "express";
import { User as UserResponse } from "malte-common/dist/oauth/GitHub";
import uuidv4 from "uuid/v4";

interface AccessTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

const USER_ID_COOKIE_NAME = "userId";

const SCOPE = "read:user,user:email";
const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const CALLBACK_PATH = "/oauth/github/callback";
const REDIRECT_PATH = "/oauth/github/auth";
const USER_PATH = "/oauth/github/user";

export default class GitHub {
  private clientId: string;
  private clientSecret: string;
  private redirectUrl: string;
  private callbackUrl: string;

  private userIdAccessTokenMap: Map<string, string>;

  constructor(app: Express) {
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    this.clientId = process.env.GH_CLIENT_ID;
    this.clientSecret = process.env.GH_CLIENT_SECRET;
    this.redirectUrl = backendUrl + REDIRECT_PATH;
    this.callbackUrl = backendUrl + CALLBACK_PATH;
    this.userIdAccessTokenMap = new Map<string, string>();

    app.get(CALLBACK_PATH, this.onCallback);
    app.get(REDIRECT_PATH, this.onRedirect);
    app.get(USER_PATH, this.onGetUser);
  }

  private onRedirect: Handler = (req, res) => {
    const userId = req.cookies?.[USER_ID_COOKIE_NAME] as string;

    if (!userId) {
      // This user doesn't have a cookie yet, let's give it one
      res.cookie(USER_ID_COOKIE_NAME, uuidv4());
    }

    return res.redirect(
      `${AUTHORIZE_URL}?client_id=${this.clientId}&scope=${SCOPE}&redirect_uri=${this.callbackUrl}`
    );
  };

  private onCallback: Handler = async (req, res) => {
    const userId = req.cookies?.[USER_ID_COOKIE_NAME] as string;
    if (!userId) {
      // We have no cookie?! Who is this user?! Let's redirect it back so a
      // cookie can be set
      return res.redirect(this.redirectUrl);
    }

    const ghCode = req.query.code;
    if (!ghCode) {
      // GitHub should always send code, let's get this lost user back to
      // the frontend
      return res.redirect(process.env.REACT_APP_FRONTEND_URL);
    }

    const response = await fetch(ACCESS_TOKEN_URL, {
      // github wants camel case here, we have to turn off the rule
      /* eslint @typescript-eslint/camelcase: 0 */

      method: "POST",
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: ghCode
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      // Maybe the time expired? Let's show the error
      return res.json(await response.json());
    }
    const data = (await response.json()) as AccessTokenResponse;
    const at = data.access_token;
    this.userIdAccessTokenMap.set(userId, at);

    // All done! This should have been opened in a popup window, as such
    // we can now close it
    return res.send(`
      <html>
        <head>
          <script>
            window.close();
          </script>
        </head>
        <body>
          <p>
            Authentication has completed successfully. You can now close
            this window.
          </p>
        </body>
      </html>
    `);
  };

  private onGetUser: Handler = async (req, res) => {
    const userId = req.cookies?.[USER_ID_COOKIE_NAME] as string;
    if (!userId) {
      return res.sendStatus(401);
    }
    const response = await this.getUser(userId);
    if (response === "needs_auth") {
      return res.sendStatus(401);
    } else if (response === "unknown_error") {
      return res.sendStatus(500);
    } else {
      return res.json(response);
    }
  };

  public async getUser(
    userId: string
  ): Promise<UserResponse | "needs_auth" | "unknown_error"> {
    const at = this.userIdAccessTokenMap.get(userId);
    if (!at) {
      return "needs_auth";
    }

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/json",
        Authorization: `token ${at}`
      }
    });

    if (!response.ok) {
      this.userIdAccessTokenMap.delete(userId);
      if (response.status === 401) {
        return "needs_auth";
      } else {
        return "unknown_error";
      }
    }

    const data = (await response.json()) as UserResponse;
    return data;
  }
}