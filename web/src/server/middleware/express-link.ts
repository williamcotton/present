import qs from "qs";
import type { Request, Response, NextFunction } from "express";
import origFetch from "isomorphic-fetch";

const styleTag = '<link rel="stylesheet" href="/app.css" />';
const metaViewportTag =
  '<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1"/>';

function renderDocument({
  defaultTitle,
  expressLink,
  renderedContent,
  description,
  title,
  buildFilename,
}: {
  defaultTitle?: string;
  expressLink: any;
  renderedContent?: string;
  description?: string;
  title?: string;
  buildFilename: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${metaViewportTag}
  <title>${title || defaultTitle}</title>
  ${styleTag}
  <meta name="description" content="${description || title || defaultTitle}">
</head>
<body>
  <div id="app">${renderedContent}</div>
  <script type="text/javascript" charset="utf-8">
    window.expressLink = ${JSON.stringify(expressLink)};
  </script>
  <script src="/${buildFilename}" type="text/javascript" charset="utf-8"></script>
</body>
</html>
`;
}

declare global {
  namespace Express {
    interface Request {
      socketHost: string;
      renderDocument: (options: {
        renderedContent?: string;
        title?: string;
        description?: string;
      }) => any;
      csrf: string;
    }
    interface Response {
      expressLink: any;
      navigate: (path: string, query?: {}) => void;
      cacheQuery: (key: string, data: {}) => void;
    }
  }
}

export default ({
    defaultTitle,
    apiBaseUrl = "",
    usePolling,
    buildFilename,
  }: {
    defaultTitle?: string;
    usePolling: boolean;
    buildFilename: string;
    apiBaseUrl?: string;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.csrf = req.csrfToken();

    res.expressLink = {
      queryCache: {},
      csrf: req.csrf,
      defaultTitle,
      usePolling,
      socketHost: req.socketHost,
    };

    global.fetch = async (...args) => {
      const response = await origFetch(...args);
      const method = args[1]?.method;
      if (method?.toUpperCase() === "GET") {
        const key = JSON.stringify(args).replace(apiBaseUrl, "");
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          console.log(data);
          res.cacheQuery(key, data);
        } catch (e) {}
      }
      return response;
    };

    req.renderDocument = ({
      renderedContent,
      title,
      description,
    }: {
      renderedContent?: string;
      title?: string;
      description?: string;
    }) =>
      renderDocument({
        defaultTitle,
        expressLink: res.expressLink,
        renderedContent,
        title,
        description,
        buildFilename,
      });

    res.navigate = (path: string, query?: {}) => {
      const pathname = query ? `${path}?${qs.stringify(query)}` : path;
      res.redirect(pathname);
    };

    res.redirect = res.redirect.bind(res);

    res.cacheQuery = (key: string, data: {}) => {
      res.expressLink.queryCache[key] = data;
    };

    next();
  };
