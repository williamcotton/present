import React from "react";

import ApplicationController from "../application";

import type { Request, Response, NextFunction } from "express";

export default class RoomsController extends ApplicationController {
  async beforeFilter(req: Request, res: Response, next: NextFunction) {
    const {
      originalUrl,
      user,
      params: { team_id: teamName },
      p: { session },
    } = req;
    if (!user) {
      res.redirect(
        session.create({ returnPath: originalUrl, server_id: teamName })
      );
    } else {
      req.teamName = teamName;
      req.currentTeam = await req.getCachedTeamStream({ teamName });
      req.localMedia = await req.getLocalMedia();
    }
    next();
  }

  async show(req: Request, res: Response) {
    const {
      params: { id: name },
      currentTeam,
      teamName,
    } = req;
    // const currentRoom = currentTeam?.rooms?.find((r) => r.name === name) || {};

    // const skipCache = currentRoom ? true : false;
    const room = await req.connectToRoom({ name });
    const title = `${teamName} - ${name}`;

    console.log(room);

    res.renderView({ room }, { title });
  }

  async create(req: Request, res: Response) {
    const {
      body: { name },
      params: { server_id },
      p: { rooms },
    } = req;
    res.redirect(rooms.show({ id: name, server_id }));
  }
}
