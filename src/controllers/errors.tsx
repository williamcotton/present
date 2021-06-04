import React from "react";

import ApplicationController from "./application";

import type { Request, Response } from "express";

export default class ErrorsController extends ApplicationController {
  async notFound(req: Request, res: Response) {
    const errorMessage = "This page isn't here!";
    res.renderComponent(<div className="error">{errorMessage}</div>, {
      statusCode: res.statusCode,
    });
  }

  async serverError(req: Request, res: Response) {
    const errorMessage = "Sorry, something went horribly wrong!";
    res.renderComponent(<div className="error">{errorMessage}</div>, {
      statusCode: res.statusCode,
    });
  }
}
