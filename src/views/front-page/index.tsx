import React, { useContext } from "react";
import { RequestContext } from "../../contexts";

export default () => {
  const { Form } = useContext(RequestContext);
  return (
    <div>
      <h1>Hello, World!</h1>
      <Form action="/signup" method="post">
        <input type="text" name="email" id="email" />
        <button className="submit">Sign up</button>
      </Form>
    </div>
  );
};
