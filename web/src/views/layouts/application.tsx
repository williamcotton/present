import React from "react";
import type { Request } from "express";

import { RequestContext } from "../../contexts";

export default function AppLayout({
  content,
  req,
}: {
  content: React.ReactElement;
  req: Request;
}): React.ReactElement {
  const {
    Form,
    p: { login },
  } = req;
  return (
    <RequestContext.Provider value={req}>
      {req.user && (
        <div>
          <div>{req.user?.displayName}</div>
          <Form action={login.destroy({ id: "true" })} method="delete">
            <button className="submit">Logout</button>
          </Form>
        </div>
      )}

      <div>{content}</div>
    </RequestContext.Provider>
  );
}
