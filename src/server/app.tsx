import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";

export const app = express();

app.get("/", (req, res) => {
  res.send(renderToString(<h1>Hello, World!</h1>));
});

export default app;
