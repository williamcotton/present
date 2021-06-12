import type { Request, Response, NextFunction, Application } from "express";
import origFetch from "isomorphic-fetch";

import dotenv from "dotenv";

dotenv.config();

export default ({
  apiBaseUrl = "",
  app,
}: {
  apiBaseUrl?: string;
  app: Application;
}) => {
  app.all("/api/v1/*", async (req, res) => {
    const { method, body, originalUrl } = req;
    const headers = new Headers({
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "X-Identity": req.user?.displayName,
    });
    const fetchOptions: any = {
      method,
      headers: headers,
      credentials: "same-origin",
    };
    if (Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }
    const response = await fetch(`${apiBaseUrl}${originalUrl}`, fetchOptions);
    const json = await response.json();
    res.send(json);
  });

  return (req: Request, res: Response, next: NextFunction) => {
    global.fetch = async (...args) => {
      const headers: any = args[1]?.headers;
      const contentType = headers?.get ? headers.get("Content-Type") : "";
      const response = await origFetch(...args);
      const method = args[1]?.method;
      if (
        method?.toUpperCase() === "GET" &&
        contentType === "application/vnd.api+json"
      ) {
        const key = JSON.stringify(args).replace(apiBaseUrl, "");
        const clonedResponse = response.clone();
        try {
          const body = await clonedResponse.text();
          const { status, statusText, headers } = clonedResponse;
          res.cacheQuery(key, { body, status, statusText, headers });
        } catch (e) {}
      }
      return response;
    };

    next();
  };
};
