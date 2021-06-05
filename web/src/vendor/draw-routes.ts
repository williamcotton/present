import type { Action, RouteOptions } from "./action-controller-base";

export type RouteType = "root" | "resources" | "error" | "namespace" | "match";

export type RouteDefinition = {
  type: RouteType;
  label: string | number;
  children: any[];
  controller?: string;
  only?: Action[];
};

type NFunction = () => {};

export type RouteArgs = [
  label: string | number,
  options?: RouteOptions | NFunction,
  n?: NFunction
];

export type RoutesDefinition = RouteDefinition[];

export type RoutesDefinitionFunc = {
  root: (...args: RouteArgs) => void;
  resources: (...args: RouteArgs) => void;
  error: (...args: RouteArgs) => void;
  namespace: (...args: RouteArgs) => void;
  match: (...args: RouteArgs) => void;
};

export default function drawRoutes(
  routesDefinitionFunc: ({
    root,
    resources,
    error,
  }: RoutesDefinitionFunc) => void
): RoutesDefinition {
  const routesDefinition: RouteDefinition[] = [];

  function nested(...args: RouteArgs) {
    const n = args[args.length - 1];
    if (typeof n === "function") {
      return n();
    }
    return null;
  }

  let branchDepth = 0;

  function branch(type: RouteType, ...args: RouteArgs) {
    const [label, options] = args;

    const route: RouteDefinition = {
      type,
      label,
      children: [],
      ...(typeof options === "object" ? options : {}),
    };

    branchDepth += 1;
    const child = nested(...args);
    branchDepth -= 1;

    if (child) {
      if (Array.isArray(child)) {
        route.children = route.children.concat(child);
      } else {
        route.children.push(child);
      }
    }

    if (branchDepth === 0) {
      routesDefinition.push(route);
    }

    return route;
  }

  function root(...args: RouteArgs) {
    return branch("root", ...args);
  }
  function resources(...args: RouteArgs) {
    return branch("resources", ...args);
  }
  function namespace(...args: RouteArgs) {
    return branch("namespace", ...args);
  }
  function match(...args: RouteArgs) {
    return branch("match", ...args);
  }
  function error(...args: RouteArgs) {
    return branch("error", ...args);
  }

  routesDefinitionFunc({ root, resources, namespace, match, error });

  return routesDefinition;
}
