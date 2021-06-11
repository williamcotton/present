import type { Request, Response, NextFunction, Router } from "express";

let initialRequest = true;

declare global {
  namespace Express {
    interface Response {
      pageview: (params: any) => Promise<{}>;
      event: (params: any) => Promise<{}>;
    }
  }
}

export default ({
  analyticsRouter,
  fetch,
}: {
  analyticsRouter: Router;
  fetch: Window["fetch"];
}) => {
  const analyticsPublish = async (
    type: string,
    req: Request,
    res: Response,
    params: any
  ) => {
    const {
      url,
      method,
      headers: { referer },
      body,
    } = req;
    const { statusCode } = res;
    const response = await fetch("/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": req.csrf,
        "Override-Referer": referer || "",
      },
      body: JSON.stringify({ type, url, body, statusCode, method, ...params }),
    });
    return response.json();
  };

  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", async () => {
      // as this is also handled server-side, we don't want to track the initial request twice
      if (!initialRequest) {
        req.url = req.originalUrl;
        res.pageview = (params) =>
          analyticsPublish("pageview", req, res, params);
        res.event = (params) => analyticsPublish("event", req, res, params);
        analyticsRouter(req, res, () => {
          analyticsPublish("log", req, res, {});
        });
      }
      initialRequest = false;
    });
    next();
  };
};
