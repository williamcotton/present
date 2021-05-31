import express from "browser-express";
import type { Application } from "express";
import type { ReactElement } from "react";
import ReactDOM from "react-dom";
import routes from "../routes";

export const app: Application = express();

app.use((req, res, next) => {
  res.renderComponent = (component: ReactElement) => {
    ReactDOM.hydrate(component, document.getElementById("app"));
  };
  next();
});

routes(app);

export default app;
