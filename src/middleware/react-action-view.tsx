import React from "react";

import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Response {
      renderView: (params?: any, options?: any) => any;
    }
  }
}

export default () => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderView = (params, options) => {
      const { filePath, action } = req.controller;
      const {
        default: ViewComponent,
      } = require(`../views${filePath}/${action}`);
      res.renderComponent(<ViewComponent {...params} />, options);
    };
    next();
  };
};
