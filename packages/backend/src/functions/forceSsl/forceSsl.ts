import { RequestHandler } from "express";

export const forceSsl: RequestHandler = (req, res, next) => {
  if (req.header("X-Forwarded-Proto") === "http") {
    res.redirect("https://" + req.headers.host + req.url);
  }
  next();
};
