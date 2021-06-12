import { graphql } from "graphql";
import type { Request, Response, NextFunction } from "express";
import type { GraphQLError } from "graphql";

class HTTPError extends Error {
  statusCode: number;
  constructor(statusCode: number, ...params: any) {
    super(...params);
    this.name = "HTTPError";
    this.statusCode = statusCode;
  }
}

declare global {
  namespace Express {
    interface Request {
      q: <Type>(
        query: string,
        variables?: {},
        options?: { cache?: boolean; abortController?: AbortController }
      ) => Promise<Type>;
      dataQuery: {
        data: { [key: string]: any } | null | undefined;
        errors: readonly GraphQLError[] | undefined;
        query: string;
        variables: {};
        options?: {};
      };
    }
  }
}

export default ({ schema, rootValue, cacheKey }: any) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.q = async (query, variables = {}) => {
      const isMutation = /^mutation/.test(query);
      const key = cacheKey(query, variables);
      const response = await graphql(schema, query, rootValue, req, variables);
      if (!isMutation) res.cacheQuery(key, response);
      const { data, errors } = response;
      if (errors) {
        const statusCode = errors[0].message === "NotFound" ? 404 : 500;
        throw new HTTPError(statusCode, errors[0].message);
      }
      req.dataQuery = {
        data,
        errors,
        query,
        variables,
      };
      return data as Promise<any>;
    };
    next();
  };
