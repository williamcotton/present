import express from "browser-express";
import type { Application } from "express";
import routes from "../routes";
import appLayout from "../views/layouts/application";
import expressLinkMiddleware from "./middleware/express-link";
import reactRendererMiddleware from "./middleware/react-renderer";
import reactActionViewMiddleware from "../middleware/react-action-view";
import controllerRouterMiddleware from "../middleware/controller-router";

export const app: Application = express();
app.use(expressLinkMiddleware());
app.use(
  reactRendererMiddleware({
    app,
    appLayout,
  })
);
app.use(reactActionViewMiddleware());
app.use(controllerRouterMiddleware({ app, routes }));

export default app;
