import ApplicationController from "./application";
import type { Request, Response } from "express";
import Room from "../models/room";
import Team from "../models/team";

export default class FrontPageController extends ApplicationController {
  async index(req: Request, res: Response) {
    res.renderView();
    Room; // if a model is not used somewhere it won't get initialized!
    const team = await Team.includes("rooms").where({ name: "wm-ads" }).all();
    console.log(team.data[0].rooms);
  }
}
