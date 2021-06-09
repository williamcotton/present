import express from "browser-express";
import type { Application } from "express";
import routes from "../routes";
import appLayout from "../views/layouts/application";
import expressLinkMiddleware from "./middleware/express-link";
import reactRendererMiddleware from "./middleware/react-renderer";
import graphqlClientMiddleware from "./middleware/graphql-client";
import authenticationMiddleware from "./middleware/authentication";
import reactActionViewMiddleware from "../middleware/react-action-view";
import controllerRouterMiddleware from "../middleware/controller-router";

const cacheKey = (query: string, variables: {}) =>
  `${query}-(${variables ? JSON.stringify(variables) : ""})`;
const route = "/graphql";

export const app: Application = express();
app.use(expressLinkMiddleware());
app.use(authenticationMiddleware({ expressLink: window.expressLink }));
app.use(
  reactRendererMiddleware({
    app,
    appLayout,
  })
);
app.use(
  graphqlClientMiddleware({
    fetch: window.fetch,
    route,
    cacheKey,
  })
);
app.use(reactActionViewMiddleware());
app.use(controllerRouterMiddleware({ app, routes }));

export default app;
