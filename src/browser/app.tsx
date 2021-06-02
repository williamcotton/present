import express from "browser-express";
import type { Application } from "express";
import routes from "../routes";
import appLayout from "../views/layouts/application";
import expressLinkMiddleware from "./middleware/express-link";
import reactRendererMiddleware from "./middleware/react-renderer";

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

routes(app);

export default app;
