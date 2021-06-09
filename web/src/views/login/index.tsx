import React, { useContext } from "react";
import { RequestContext } from "../../contexts";

export default ({ returnPath }: { returnPath: string }) => {
  const {
    Form,
    p: { login },
  } = useContext(RequestContext);
  return (
    <div className="login">
      <h2>Login</h2>
      <div className="form-container">
        <Form action={login.create()} method="post">
          <label htmlFor="displayName">
            Name
            <input type="text" name="displayName" id="displayName" />
          </label>
          <input type="hidden" name="returnPath" value={returnPath} />
          <button className="submit">Login</button>
        </Form>
      </div>
    </div>
  );
};
