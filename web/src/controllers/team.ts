import ApplicationController from "./application";
import type { Request, Response } from "express";

export default class TeamController extends ApplicationController {
  async show(req: Request, res: Response) {
    const teamName = req.params.id;
    const team = await req.getTeamStream({ teamName });
    req.currentTeam = team;
    res.renderView();
  }
}
