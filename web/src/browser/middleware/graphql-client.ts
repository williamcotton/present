import type { Request, Response, NextFunction } from "express";
import type { GraphQLError } from "graphql";

const localQueryCache: any = {};
let initialRequest = true;

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
        variables: {},
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

export default ({ fetch, route, cacheKey }: any) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.q = async (query, variables, options = {}) => {
      const cache = "cache" in options ? options.cache : true;
      const isMutation = /^mutation/.test(query);
      const key = cacheKey(query, variables);

      // if it's the initial page request or we're caching the query after further requests, check the server side query cache and the local query cache
      const cachedResponse =
        initialRequest || (cache && !initialRequest)
          ? Object.assign(req.queryCache, localQueryCache)[key]
          : false;

      const fetchResponse = async () => {
        const fetchOptions: any = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-Token": req.csrf,
          },
          body: JSON.stringify({ query, variables }),
        };
        if (options.abortController) {
          fetchOptions.signal = options.abortController.signal;
        }
        const response = await fetch(route, fetchOptions);
        return response.json();
      };

      // if we don't have a cached response, fetch from the server
      const response = cachedResponse || (await fetchResponse());

      // if we're caching and it's not a mutation and not the intial request, then store the response in the local query cache
      if (cache && !isMutation && !initialRequest) {
        localQueryCache[key] = response;
      }

      const { data, errors } = response;

      if (errors) {
        const statusCode = errors[0].message === "NotFound" ? 404 : 500;
        throw new HTTPError(statusCode, errors[0].message);
      }

      // store the data, errors, query and variables on the request for other interested middleware, eg, event tracking for analytics
      req.dataQuery = {
        data,
        errors,
        query,
        variables,
        options,
      };

      initialRequest = false;

      return data;
    };

    next();
  };
