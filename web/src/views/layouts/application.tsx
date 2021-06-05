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
  return (
    <RequestContext.Provider value={req}>{content}</RequestContext.Provider>
  );
}
