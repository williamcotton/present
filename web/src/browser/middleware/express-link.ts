import qs from "qs";
import type { Request, Response, NextFunction } from "express";

const { expressLink, fetch: origFetch } = window;
const querySelector = (selectors: any) => document.querySelector(selectors);

declare global {
  namespace Express {
    interface Request {
      renderDocument: (options: {
        renderedContent?: string;
        title?: string;
        description?: string;
      }) => any;
      csrf: string; // comes from expressLink
      queryCache: any;
      // [key: string]: any;
    }
  }
  interface Window {
    expressLink: { [key: string]: any };
  }
}

export default () => (req: any, res: Response, next: NextFunction) => {
  const { defaultTitle } = expressLink;
  Object.keys(expressLink).forEach((key) => (req[key] = expressLink[key]));

  global.fetch = async (...args) => {
    const key = JSON.stringify(args);
    const cachedResponse = req.queryCache[key];
    return cachedResponse
      ? new Response(cachedResponse.body, cachedResponse)
      : await origFetch(...args);
  };

  req.renderDocument = ({ title }: { title?: string }) => {
    querySelector("title").innerText = title || defaultTitle;
    return { appContainer: document.querySelector("#app") };
  };

  res.navigate = (path: string, query?: {}) => {
    const pathname = query ? `${path}?${qs.stringify(query)}` : path;
    res.redirect(pathname);
  };

  res.redirect = res.redirect.bind(res);

  next();
};
