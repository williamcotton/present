import express from "express";
import React from "react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import routes from "../routes";
import webpackConfig from "../../webpack.config";

export const app = express();

const buildPath = webpackConfig.output.path;
const buildFilename = webpackConfig.output.filename;

app.use(express.static(buildPath));

app.use((req, res, next) => {
  res.renderComponent = (component: ReactElement) => {
    res.send(
      `${renderToString(
        <div id="app">{component}</div>
      )}<script src="/${buildFilename}" type="text/javascript" charset="utf-8"></script>`
    );
  };
  next();
});

routes(app);

export default app;
