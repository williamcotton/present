import React from "react";
import type { Application } from "express";

export default function (app: Application) {
  app.get("/", (req, res) => {
    res.renderComponent(
      <h1 onClick={() => console.log("Hi!")}>Hello, World!</h1>
    );
  });
}
