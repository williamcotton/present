export default function drawRoutes(routesDefinitionFunc: any) {
  const routesDefinition: any[] = [];

  function nested(...args: any[]) {
    const n = args[args.length - 1];
    if (typeof n === "function") {
      return n();
    }
    return null;
  }

  let branchDepth = 0;

  function branch(type: string, ...args: any[]) {
    const [label, options] = args;

    const route = {
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

  function root(...args: any[]) {
    return branch("root", ...args);
  }
  function resources(...args: any[]) {
    return branch("resources", ...args);
  }
  function namespace(...args: any[]) {
    return branch("namespace", ...args);
  }
  function match(...args: any[]) {
    return branch("match", ...args);
  }
  function error(...args: any[]) {
    return branch("error", ...args);
  }

  routesDefinitionFunc({ root, resources, namespace, match, error });

  return routesDefinition;
}
