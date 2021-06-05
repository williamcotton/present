import ApplicationController from "./application";

import type { Request, Response } from "express";

export default class SignupController extends ApplicationController {
  async create(req: Request, res: Response) {
    const { email } = req.body;
    res.renderView({ email });
  }
}
