import React from "react";
import type { Application } from "express";

export default function (app: Application) {
  app.get("/", (req, res) => {
    const { Form } = req;
    res.renderComponent(
      <div>
        <h1>Hello, World!</h1>
        <Form action="/signup" method="post">
          <input type="text" name="email" id="email" />
          <button className="submit">Sign up</button>
        </Form>
      </div>
    );
  });

  app.post("/signup", (req, res) => {
    const {
      body: { email },
    } = req;
    res.navigate("/signup-confirmation", { email });
  });

  app.get("/signup-confirmation", (req, res) => {
    const {
      query: { email },
    } = req;
    res.renderComponent(<h3>{email}</h3>);
  });
}
