import pluralize from "pluralize";

// TODO: figure out dynamic routing so we can avoid hard coding this!
import errorController from "../controllers/errors";

import type {
  Application,
  Request,
  Response,
  NextFunction,
  Router,
} from "express";
import type { RoutesDefinition, RouteDefinition } from "../vendor/draw-routes";
import type { Action, Method } from "../vendor/action-controller-base";

declare global {
  namespace Express {
    interface Application {
      paths: {};
    }
    interface Request {
      p: {};
      controller: {
        routePath: string;
        filePath: string;
        action: Action;
        method: Method;
        path: string;
        options: any;
      };
    }
  }
}

interface ControllerInstance {
  paths: {};
  router: Router;
}

type ControllerOptions = {
  filePath: string;
  label: string;
  routePath: string;
  action?: Action;
  options: any;
  only?: Action[];
  children?: any[];
  match?: string;
  path?: string;
  basePath?: string;
  fileBasePath?: string;
  controller?: any;
};

interface ControllerClass {
  new (options: ControllerOptions): ControllerInstance;
}

export default ({
  app,
  routes,
}: {
  app: Application;
  routes: RoutesDefinition;
}) => {
  const errors: any[] = [];
  const paths: { [key: string]: any } = {};

  app.paths = paths;

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.p = paths;
    next();
  });

  function loadController(opts: ControllerOptions) {
    const Controller: ControllerClass =
      require(`../controllers${opts.filePath}`).default;
    const controllerInstance = new Controller(opts);
    paths[opts.label] = controllerInstance.paths;
    app.use(opts.routePath, controllerInstance.router);
  }

  let map: {
    [key: string]: any;
  };

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
      children.forEach((childRoute: RouteDefinition) => {
        map[childRoute.type](
          Object.assign(childRoute, { basePath, fileBasePath })
        );
      });
    }
  }

  map = {
    root: (options: ControllerOptions) => {
      const { label } = options;
      const filePath = `/${label}`;
      const routePath = "";
      const action = "index";
      loadController({ filePath, routePath, action, label, options });
    },
    namespace: (options: ControllerOptions) => {
      const { label, children, basePath = "" } = options;
      const filePath = `${basePath}/${label}`;
      nestedChildren({ children, basePath: filePath });
    },
    resources: (options: ControllerOptions) => {
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
    match: (options: ControllerOptions) => {
      const { label: match, controller, action } = options;
      const filePath = `/${controller}`;
      const routePath = "";
      const label = controller;
      loadController({ filePath, routePath, match, action, label, options });
    },
    error: (error: ControllerOptions) => errors.push(error),
  };

  routes.forEach((route) => {
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
      // TODO: figure out dynamic routing
      // const filepath = `../controllers/${controller}`;
      try {
        // const { default: Controller } = require(filepath);
        const Controller = errorController;
        errorControllers[controller] = new Controller();
      } catch (e) {
        // TODO: Error: Cannot find module '../controllers/errors
        // console.error(e);
      }
    });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.statusCode = 404;
    const error = errors.filter((e) => e.label === res.statusCode)[0];
    if (error) {
      const { controller, action } = error;
      const controllerInstance = errorControllers[controller];
      controllerInstance[action](req, res);
    }
    next();
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const statusCode = err.response?.status
      ? err.response.status
      : err.statusCode || 500;
    res.statusCode = statusCode;
    const error = errors.filter((e) => e.label === statusCode)[0];
    if (error) {
      const { controller, action } = error;
      const controllerInstance = errorControllers[controller];
      controllerInstance[action](req, res);
    }
    next();
  });

  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};
