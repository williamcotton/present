import express from "browser-express";
import type { Application } from "express";
import routes from "../routes";
import appLayout from "../views/layouts/application";
import expressLinkMiddleware from "./middleware/express-link";
import reactRendererMiddleware from "./middleware/react-renderer";
import reactActionViewMiddleware from "../middleware/react-action-view";
import controllerRouterMiddleware from "../middleware/controller-router";

declare global {
  interface Window {
    expressLink: any;
  }
}

const { fetch, expressLink } = window;
const querySelector = (selectors: any) => document.querySelector(selectors);

export const app: Application = express();
app.use(expressLinkMiddleware({ expressLink, querySelector }));
app.use(
  reactRendererMiddleware({
    app,
    appLayout,
  })
);
app.use(reactActionViewMiddleware());
app.use(controllerRouterMiddleware({ app, routes }));

export default app;
