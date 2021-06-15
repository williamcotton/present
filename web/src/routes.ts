import drawRoutes from "./vendor/draw-routes";

export default drawRoutes(({ root, resources, error }) => {
  root("front-page");

  resources("signup", { only: ["index", "create"] });
  resources("login", { only: ["index", "create", "destroy"] });
  resources("team", { only: ["show"] });

  resources(
    "team",
    { only: ["show"] }, // TODO: set param to /:serverName to override /:server_id
    () => [
      resources("room", { only: ["show", "create"] }), // TODO: set param to /:name to override /:id
    ]
  );

  error(404, { controller: "errors", action: "notFound" });
  error(500, { controller: "errors", action: "serverError" });
});
