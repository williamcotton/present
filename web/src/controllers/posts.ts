import type { Request, Response } from "express";
import ApplicationController from "./application";

import Post from "../models/post";

export default class PostsController extends ApplicationController {
  async index(req: Request, res: Response) {
    const posts = (await Post.all()).data;
    res.renderView({ posts });
  }
}
