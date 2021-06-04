import routerFactory from "router";
import { compile, parse } from "path-to-regexp";
import qs from "qs";

import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      controller: {
        routePath: string;
        filePath: string;
        action: string;
        method: string;
        path: string;
        options: any;
      };
    }
  }
}

function e(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch((err: any) => next(err));
    }
  };
}

const ACTIONS = [
  {
    action: "index",
    method: "get",
    path: "/",
  },
  {
    action: "show",
    method: "get",
    path: "/:id",
  },
  {
    action: "create",
    method: "post",
    path: "/",
  },
  {
    action: "update",
    method: "patch",
    path: "/:id",
  },
  {
    action: "destroy",
    method: "delete",
    path: "/:id",
  },
];

function initControllerAction({
  options,
  controller,
  action,
  method,
  path,
}: {
  options: any;
  controller: any;
  action: string;
  method: string;
  path: string;
}) {
  const actionFunc = controller[action];
  if (
    actionFunc &&
    (options && options.only ? options.only.includes(action) : true) &&
    (options && options.action ? options.action === action : true)
  ) {
    const handler = e(actionFunc.bind(controller));
    const { routePath, filePath } = options;
    const basePathBuilder = compile(routePath + path);
    const tokens: Array<any> = parse(routePath + path);
    const validPathParams = tokens
      .filter((token) => token.name)
      .map((token) => token.name);
    const pathBuilder = (opts: any = {}) => {
      const queryParams = Object.keys(opts).reduce((qp: any, key) => {
        if (!validPathParams.includes(key)) {
          qp[key] = opts[key];
        }
        return qp;
      }, {});
      let builtPath = basePathBuilder(opts).replace(/^(.+?)\/*?$/, "$1"); // https://stackoverflow.com/a/45737717
      if (Object.keys(queryParams).length > 0) {
        builtPath += `?${qs.stringify(queryParams)}`;
      }
      return builtPath;
    };

    pathBuilder.action = options;
    controller.paths[action] = pathBuilder;
    controller.router[method](
      path,
      (req: Request, res: Response, next: NextFunction) => {
        req.controller = {
          routePath,
          filePath,
          action,
          method,
          path,
          options,
        };
        handler(req, res, next);
      }
    );
  }
}

function initController({
  controller,
  options,
}: {
  controller: any;
  options: any;
}) {
  ACTIONS.forEach(({ action, method, path }) =>
    initControllerAction({ controller, options, action, method, path })
  );
}

export default class ActionControllerBase {
  router: any;
  options: any;
  paths: any;
  beforeFilter: any;

  constructor(options?: any) {
    this.router = routerFactory({ mergeParams: true });
    this.options = options;
    this.paths = {};
    // TODO: this.layout; layout = 'room_layout'
    if (this.beforeFilter) {
      this.router.use(this.beforeFilter);
    }
    initController({ controller: this, options });
  }
}
