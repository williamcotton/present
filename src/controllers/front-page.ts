import ApplicationController from "./application";

import type { Request, Response } from "express";

export default class FrontPageController extends ApplicationController {
  async index(req: Request, res: Response) {
    res.renderView();
  }
}
