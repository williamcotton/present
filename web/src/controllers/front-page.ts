import ApplicationController from "./application";
import type { Request, Response } from "express";

export default class FrontPageController extends ApplicationController {
  async index(req: Request, res: Response) {
    const team = await req.getTeamStream({ teamName: "wm-ads" });
    req.currentTeam = team;
    res.renderView();
  }
}
