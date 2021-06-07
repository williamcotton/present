import ApplicationController from "./application";
import User from "../models/user";
import type { Request, Response } from "express";

export default class FrontPageController extends ApplicationController {
  async index(req: Request, res: Response) {
    let response = await User.find(1);
    console.log(response.data.email);
    console.log(response.data.name);
    res.renderView();
  }
}
