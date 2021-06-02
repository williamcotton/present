import React from "react";
import ReactDOM from "react-dom";
import serialize from "form-serialize";
import type { Application, Request, Response, NextFunction } from "express";

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

export default function reactRendererMiddleware({
  app,
  appLayout,
}: {
  app: Application;
  appLayout: ({}: {
    content: React.ReactElement;
    req: Request;
  }) => React.ReactElement;
}) {
  const onClick = (e: React.MouseEvent<HTMLLinkElement>) => {
    e.preventDefault();
    function hrefOrParent(target: HTMLLinkElement): string | false {
      if (target.href) {
        return target.href;
      }
      if (target.parentElement) {
        return hrefOrParent(target.parentElement as any);
      }
      return false;
    }
    const href = hrefOrParent(e.currentTarget);
    app.navigate(href);
  };

  const Link = (props: any) => {
    const mergedProps = { onClick, ...props };
    return <a {...mergedProps} />;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = serialize(e.currentTarget, { hash: true });
    app.submit(
      e.currentTarget.action,
      e.currentTarget.getAttribute("method"),
      body
    );
  };

  return (req: Request, res: Response, next: NextFunction) => {
    req.Link = Link;

    req.navigate = app.navigate.bind(app);

    req.submit = app.submit.bind(app);

    req.Form = (props: any) => {
      const mergedProps = {
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
          onSubmit(e);
          if (props.afterSubmit) props.afterSubmit();
        },
        ...props,
      };
      const { children } = mergedProps;
      delete mergedProps.children;
      delete mergedProps.afterSubmit;
      const formElements: Array<React.ReactElement> = [].concat(children);
      formElements.push(<input type="hidden" name="_csrf" value={req.csrf} />);
      return <form {...mergedProps}>{formElements}</form>;
    };

    res.renderComponent = (
      content: React.ReactElement,
      options: {
        title?: string;
        description?: string;
        statusCode?: number;
        layout?: ({}: {
          content: React.ReactElement;
          req: Request;
        }) => React.ReactElement;
      } = {}
    ) => {
      const { title, description } = options;
      const statusCode = options.statusCode || 200;
      const Layout = options.layout || appLayout;
      const { appContainer } = req.renderDocument({ title, description });
      ReactDOM.hydrate(
        <Layout content={content} req={req} />,
        appContainer,
        () => {
          res.status(statusCode);
          res.send();
        }
      );
    };
    next();
  };
}
