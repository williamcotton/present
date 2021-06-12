import format from "date-fns/format";
import colors from "colors/safe";
import type {
  Request,
  Response,
  NextFunction,
  Router,
  Application,
} from "express";

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
  app,
}: {
  analyticsRouter: Router;
  app: Application;
}) => {
  const analyticsPageview = async (params: any) => ({}); // ({ url, headers, ip, title }) => {};
  const analyticsEvent = async (params: any) => ({}); // ({ url, headers, ip, title, payload }) => {};
  const commonLogFormat = (req: Request, res: Response) => {
    const {
      ip,
      url,
      method,
      httpVersion,
      user,
      body,
      headers: { referer, "user-agent": userAgent },
    } = req;
    const { statusCode } = res;
    const statusCodeString =
      statusCode >= 500
        ? colors.red(statusCode.toString())
        : statusCode >= 300
        ? colors.yellow(statusCode.toString())
        : colors.green(statusCode.toString());
    const userJson = user ? JSON.stringify(user) : false;
    const bodyJson = body ? JSON.stringify(body) : false;
    const rawRequest = `${method.toUpperCase()} ${url} HTTP/${httpVersion}`;
    const timestamp = format(new Date(), "dd/MMM/yyyy:hh:mm:ss XXX");
    console.log(
      `${ip} user-json ${colors.yellow(
        userJson || "-"
      )} [${timestamp}] "${colors.blue(rawRequest)}" ${
        statusCodeString || "-"
      } - "${referer || "-"}" "${colors.gray(userAgent || "")}" ${colors.cyan(
        bodyJson || "-"
      )}`
    );
    // ip user-json displayName [timestamp] "rawRequest" statusCode byteSize "referer" "userAgent" bodyJson
  };

  app.post("/analytics", (req, res) => {
    const { headers, body, ip } = req;
    const { type, url, body: reqBody, statusCode, method, ...params } = body;
    req.url = url;
    res.statusCode = statusCode;
    req.method = method;
    req.body = reqBody;
    // @ts-ignore
    headers.referer = headers["override-referer"];
    delete headers["override-referer"];
    commonLogFormat(req, res);
    switch (type) {
      case "pageview":
        analyticsPageview({ headers, ip, ...params });
        break;
      case "event":
        analyticsEvent({ headers, ip, ...params });
        break;
      default:
    }
    res.statusCode = 200;
    res.json({ success: true });
  });

  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      req.url = req.originalUrl;
      const { url, headers, ip } = req;
      commonLogFormat(req, res);
      res.pageview = (params) =>
        analyticsPageview({ url, headers, ip, ...params });
      res.event = (params) => analyticsEvent({ url, headers, ip, ...params });
      analyticsRouter(req, res, () => {});
    });
    next();
  };
};
