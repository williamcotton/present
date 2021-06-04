import React from "react";

import type { Request } from "express";

export const RequestContext = React.createContext<Request>({} as Request);
