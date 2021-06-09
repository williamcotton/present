import React, { useContext } from "react";
import { RequestContext } from "../../contexts";

export default () => {
  const { Form } = useContext(RequestContext);
  return (
    <div>
      <h1>Sign Up</h1>
      <Form action="/signup" method="post">
        <label htmlFor="name">
          Name
          <input type="text" name="name" id="name" />
        </label>
        <label htmlFor="email">
          Email
          <input type="text" name="email" id="email" />
        </label>
        <button className="submit">Sign up</button>
      </Form>
    </div>
  );
};
