import type { Request, Response } from "express";
import ApplicationController from "./application";

export type CreateBody = { displayName: string; returnPath: string };

export default class LoginController extends ApplicationController {
  async index(req: Request, res: Response) {
    const { returnPath } = req.query;
    res.renderView({ returnPath });
  }

  async create(req: Request, res: Response) {
    const { displayName, returnPath } = <CreateBody>req.body;
    const user = await req.login({ displayName });
    if (user) {
      res.navigate(returnPath || "/");
    }
  }

  async destroy(req: Request, res: Response) {
    await req.logout();
    if (typeof window !== "undefined") {
      window.location.pathname = "/"; // force full browser page reload to release getUserMedia
    } else {
      res.navigate("/");
    }
  }
}
