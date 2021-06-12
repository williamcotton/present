import express from "browser-express";

import type { Application } from "express";
import routes from "../routes";
import appLayout from "../views/layouts/application";
import expressLinkMiddleware from "./middleware/express-link";
import reactRendererMiddleware from "./middleware/react-renderer";
import graphqlClientMiddleware from "./middleware/graphql-client";
import authenticationMiddleware from "./middleware/authentication";
import spraypaintMiddleware from "./middleware/spraypaint";
import analyticsMiddleware from "./middleware/analytics";
import teamStreamMiddleware from "./middleware/team-stream";
import reactActionViewMiddleware from "../middleware/react-action-view";
import controllerRouterMiddleware from "../middleware/controller-router";

import { analyticsRouter } from "../analytics-router";

import User from "../models/user";
import Room from "../models/room";
import Team from "../models/team";
import RoomConnection from "../models/room-connection";

declare global {
  interface Window {
    User: any;
    Room: any;
    Team: any;
    RoomConnection: any;
  }
}
window.User = User;
window.Room = Room;
window.Team = Team;
window.RoomConnection = RoomConnection;

const cacheKey = (query: string, variables: {}) =>
  `${query}-(${variables ? JSON.stringify(variables) : ""})`;
const route = "/graphql";

export const app: Application = express();
app.use(expressLinkMiddleware());
app.use(authenticationMiddleware({ expressLink: window.expressLink }));
app.use(spraypaintMiddleware());
app.use(
  reactRendererMiddleware({
    app,
    appLayout,
  })
);
app.use(
  graphqlClientMiddleware({
    fetch,
    route,
    cacheKey,
  })
);
app.use(analyticsMiddleware({ analyticsRouter, fetch }));
app.use(teamStreamMiddleware());
app.use(reactActionViewMiddleware());
app.use(controllerRouterMiddleware({ app, routes }));

export default app;
