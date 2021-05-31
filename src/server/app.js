import express from "express";
import React from "react";
import h from "react-hyperscript";
import { renderToString } from "react-dom/server.js";

const e = React.createElement;

export const app = express();

app.get("/", (req, res) => {
  res.send(renderToString(h("h1", "Hello, World!")));
});

export default app;
