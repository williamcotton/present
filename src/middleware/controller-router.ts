import pluralize from "pluralize";

import type { Application, Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Application {
      paths: any;
    }
    interface Request {
      p: any;
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

export default ({ app, routes }: { app: Application; routes: any }) => {
  const errors: any[] = [];
  const paths: any = {};

  app.paths = paths;

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.p = paths;
    next();
  });

  function loadController(opts: any) {
    const { default: Controller } = require(`../controllers${opts.filePath}`);
    const controllerInstance = new Controller(opts);
    paths[opts.label] = controllerInstance.paths;
    app.use(opts.routePath, controllerInstance.router);
  }

  let map: any;

  function nestedChildren({
    children,
    basePath,
    fileBasePath,
  }: {
    children: any;
    basePath: string;
    fileBasePath?: string;
  }) {
    if (children) {
      children.forEach((childRoute: any) => {
        map[childRoute.type](
          Object.assign(childRoute, { basePath, fileBasePath })
        );
      });
    }
  }

  map = {
    root: (options: any) => {
      const { label } = options;
      const filePath = `/${label}`;
      const routePath = "";
      const action = "index";
      loadController({ filePath, routePath, action, label, options });
    },
    namespace: (options: any) => {
      const { label, children, basePath = "" } = options;
      const filePath = `${basePath}/${label}`;
      nestedChildren({ children, basePath: filePath });
    },
    resources: (options: any) => {
      const {
        path,
        label,
        only,
        children,
        basePath = "",
        fileBasePath = "",
      } = options;
      const filePath = `${fileBasePath}/${label}`;
      const routePath = `${basePath}/${path || label}`;
      const nestedBasePath = `${routePath}/:${pluralize.singular(label)}_id`;
      loadController({ filePath, routePath, only, label, options, children });
      nestedChildren({
        children,
        basePath: nestedBasePath,
        fileBasePath: filePath,
      });
    },
    match: (options: any) => {
      const { label: match, controller, action } = options;
      const filePath = `/${controller}`;
      const routePath = "";
      const label = controller;
      loadController({ filePath, routePath, match, action, label, options });
    },
    error: (error: any) => errors.push(error),
  };

  routes.forEach((route: any) => {
    if (map[route.type]) {
      map[route.type](route);
    }
  });

  const errorControllers: any = {};

  errors
    .map(({ controller }) => controller)
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    })
    .forEach((controller) => {
      const filepath = `../../controllers/${controller}`;
      const Controller = require(filepath);
      errorControllers[controller] = new Controller();
    });

  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    res.statusCode = statusCode;
    const { controller, action } = errors.filter(
      (e) => e.label === statusCode
    )[0];
    if (controller && action) {
      const controllerInstance = errorControllers[controller];
      controllerInstance[action](req, res);
    }
    next();
  });

  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};
