import React from "react";
import type { Request } from "express";

export default function AppLayout({
  content,
  req,
}: {
  content: React.ReactElement;
  req: Request;
}): React.ReactElement {
  return <>{content}</>;
}
