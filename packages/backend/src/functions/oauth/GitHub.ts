import fetch from "node-fetch";
import { Express, Handler } from "express";

interface AccessTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}
interface UserResponse {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  name: string;
  email: string;
}

const USER_ID_COOKIE_NAME = "userId";

const SCOPE = "read:user,user:email";
const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const CALLBACK_PATH = "/oauth/github/callback";
const REDIRECT_PATH = "/oauth/github/auth";
const USER_PATH = "/oauth/github/user";

const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomUUID() {
  // TODO: actually use UUIDv4 when I get internet
  let str = "";
  for (let i = 0; i < 32; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

export default class GitHub {
  private clientId: string;
  private clientSecret: string;
  private redirectUrl: string;
  private callbackUrl: string;

  private userIdAccessTokenMap: Map<string, string>;

  constructor(app: Express) {
    this.clientId = process.env.githubClientId;
    this.clientSecret = process.env.githubClientSecret;
    this.redirectUrl = process.env.REACT_APP_BACKEND_URL + REDIRECT_PATH;
    this.callbackUrl = process.env.REACT_APP_BACKEND_URL + CALLBACK_PATH;
    this.userIdAccessTokenMap = new Map<string, string>();

    app.get(CALLBACK_PATH, this.onCallback);
    app.get(REDIRECT_PATH, this.onRedirect);
    app.get(USER_PATH, this.onGetUser);
  }

  onRedirect: Handler = (req, res) => {
    const userId = req.cookies?.[USER_ID_COOKIE_NAME] as string;
    if (userId && this.userIdAccessTokenMap.has(userId)) {
      // We already have an access token, great! Let's get this user back to
      // the frontend
      return res.redirect(process.env.REACT_APP_FRONTEND_URL);
    }

    res.cookie(USER_ID_COOKIE_NAME, randomUUID());
    return res.redirect(
      `${AUTHORIZE_URL}?client_id=${this.clientId}&scope=${SCOPE}&redirect_uri=${this.callbackUrl}`
    );
  };

  onCallback: Handler = async (req, res) => {
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
    console.log("GOT THE ACCESS TOKEN");

    // All done! Let's get user back to frontend
    return res.redirect(process.env.REACT_APP_FRONTEND_URL);
  };

  onGetUser: Handler = async (req, res) => {
    const userId = req.cookies?.[USER_ID_COOKIE_NAME] as string;
    if (!userId) {
      // We have no cookie?! Who is this user?! Let's redirect it back so a
      // cookie can be set
      return res.redirect(this.redirectUrl);
    }
    console.log("got user id");
    const at = this.userIdAccessTokenMap.get(userId);
    if (!at) {
      // No access token, can't get user. Let's authenticate user again
      return res.redirect(this.redirectUrl);
    }
    console.log("got access token");

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/json",
        Authorization: `token ${at}`
      }
    });

    if (!response.ok) {
      this.userIdAccessTokenMap.delete(userId);
      // Access token must be invalid, let's try to auth them again
      return res.status(403).json(await response.json());
    }

    const data = (await response.json()) as UserResponse;
    return res.json(data);
  };
}
