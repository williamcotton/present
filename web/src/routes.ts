import drawRoutes from "./vendor/draw-routes";

export default drawRoutes(({ root, resources, error }) => {
  root("front-page");

  resources("signup", { only: ["index", "create"] });
  resources("login", { only: ["index", "create", "destroy"] });

  error(404, { controller: "errors", action: "notFound" });
  error(500, { controller: "errors", action: "serverError" });
});
