import { app } from "../src/server/app";

export const PORT = 4242;

export async function appFactory() {
  return app.listen(PORT);
}

export default appFactory;
