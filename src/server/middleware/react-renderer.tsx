import React from "react";
import { renderToString } from "react-dom/server";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Application {
      navigate: (href: string | false) => void;
      submit: (path: string, type: string | null, body: any) => void;
    }
    interface Request {
      Link: React.FC;
      Form: React.FC;
      navigate: (href: string | false) => void;
      submit: (path: string, type: string | null, body: any) => void;
    }
    interface Response {
      renderComponent(component: React.ReactElement): void;
    }
  }
}

const Link = (props: any) => <a {...props} />;

export default ({
    appLayout,
  }: {
    appLayout: ({}: {
      content: React.ReactElement;
      req: Request;
    }) => React.ReactElement;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.Link = Link;

    const Form = (props: any) => {
      const mergedProps = { ...props };
      const { children } = mergedProps;
      delete mergedProps.children;
      const formElements: Array<React.ReactElement> = [].concat(children);
      formElements.push(<input type="hidden" name="_csrf" value={req.csrf} />);
      return <form {...mergedProps}>{formElements}</form>;
    };

    req.Form = Form;

    res.renderComponent = (
      content: React.ReactElement,
      options: {
        layout?: ({}: {
          content: React.ReactElement;
          req: Request;
        }) => React.ReactElement;
        title?: string;
        description?: string;
        statusCode?: number;
      } = {}
    ) => {
      const Layout = options.layout || appLayout;
      const renderedContent = renderToString(
        <Layout content={content} req={req} />
      );
      const { title, description } = options;
      const statusCode = options.statusCode || 200;
      res.writeHead(statusCode, { "Content-Type": "text/html" });
      res.end(
        req.renderDocument({
          renderedContent,
          title,
          description,
        })
      );
    };

    next();
  };
