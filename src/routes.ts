import drawRoutes from "./vendor/draw-routes";

export default drawRoutes(({ root, resources, error }) => {
  root("front-page");

  resources("signup", { only: ["create"] });

  error(404, { controller: "errors", action: "notFound" });
  error(500, { controller: "errors", action: "serverError" });
});
