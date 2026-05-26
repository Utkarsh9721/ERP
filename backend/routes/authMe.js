import express from "express";
import authMiddleware from "../jwtRedis/login.js";

const Router = express.Router();

Router.get("/me", authMiddleware(), (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

export default Router;
