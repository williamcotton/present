import React from "react";
import type { Request } from "express";
import Team from "../models/team";

export const TeamStreamContext = React.createContext<Team>({} as Team);
export const RequestContext = React.createContext<Request>({} as Request);
