import type { Request, Response, NextFunction } from "express";
import { MiddlewareStack } from "spraypaint";

import ApplicationRecord from "../../models/application-record";

const { fetch: origFetch } = window;

export default () => (req: Request, res: Response, next: NextFunction) => {
  let middleware = new MiddlewareStack();

  middleware.beforeFilters.push((url, options: any) => {
    options.headers["X-CSRF-Token"] = req.csrf;
  });

  ApplicationRecord.middlewareStack = middleware;

  global.fetch = async (...args) => {
    const key = JSON.stringify(args);
    const cachedResponse = req.queryCache[key];
    return cachedResponse
      ? new Response(cachedResponse.body, cachedResponse)
      : await origFetch(...args);
  };

  next();
};
