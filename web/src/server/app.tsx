import express from "express";
import compression from "compression";
import enforce from "express-sslify";
import cookieSession from "cookie-session";
import csurf from "csurf";
import dotenv from "dotenv";
import expressLinkMiddleware from "./middleware/express-link";
import reactRendererMiddleware from "./middleware/react-renderer";
import reactActionViewMiddleware from "../middleware/react-action-view";
import controllerRouterMiddleware from "../middleware/controller-router";
import routes from "../routes";
import webpackConfig from "../../webpack.config";
import appLayout from "../views/layouts/application";

dotenv.config();
const nodeEnv = process.env.NODE_ENV;
const sessionSecret = process.env.SESSION_SECRET;
const defaultTitle = process.env.DEFAULT_TITLE;
const apiBaseUrl = process.env.API_BASE_URL;

const cookieSessionOptions: any = {
  name: "session",
  sameSite: "lax",
  keys: [sessionSecret],
};

const buildPath = webpackConfig.output.path;
const buildFilename = webpackConfig.output.filename;

export const app = express();
app.disable("x-powered-by");
if (nodeEnv === "production") {
  app.set("trust proxy", 1);
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
  cookieSessionOptions.secure = true;
}
app.use(compression());
app.use(express.static(buildPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.all("/api/v1/*", async (req, res) => {
  const { path, method } = req;
  const headers = new Headers({
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  });
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: headers,
    credentials: "same-origin",
  });
  const json = await response.json();
  res.send(json);
});
app.use(cookieSession(cookieSessionOptions));
app.use(csurf());
app.use(
  expressLinkMiddleware({
    defaultTitle,
    usePolling: false,
    buildFilename,
    apiBaseUrl,
  })
);
app.use(reactRendererMiddleware({ appLayout }));
app.use(reactActionViewMiddleware());
app.use(controllerRouterMiddleware({ app, routes }));
export default app;
