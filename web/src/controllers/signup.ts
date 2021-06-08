import ApplicationController from "./application";
import User from "../models/user";
import type { Request, Response } from "express";

export default class SignupController extends ApplicationController {
  async create(req: Request, res: Response) {
    const { email } = req.body;
    const name = "Willie";
    const user = new User({ email, name });
    let success = await user.save();
    res.renderView({ user, success });
  }
}
