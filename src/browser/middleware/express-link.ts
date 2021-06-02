import qs from "qs";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      renderDocument: (options: any) => any;
      csrf: string; // comes from expressLink
    }
  }
}

export default ({
    expressLink,
    querySelector,
  }: {
    expressLink: { [key: string]: any };
    querySelector: any;
  }) =>
  (req: any, res: Response, next: NextFunction) => {
    const { defaultTitle } = expressLink;
    Object.keys(expressLink).forEach((key) => (req[key] = expressLink[key]));

    req.renderDocument = ({ title }: { title: string }) => {
      querySelector("title").innerText = title || defaultTitle;
      return { appContainer: querySelector("#app") };
    };

    res.navigate = (path: string, query: {}) => {
      const pathname = query ? `${path}?${qs.stringify(query)}` : path;
      res.redirect(pathname);
    };

    res.redirect = res.redirect.bind(res);

    next();
  };
