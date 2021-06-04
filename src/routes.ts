import drawRoutes from "./vendor/draw-routes";

export default drawRoutes(({ root, resources, error }: any) => {
  root("front-page");

  resources("signup", { only: ["create"] });
});
