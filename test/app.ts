import path from 'path';
import { app } from "../src/server/app";

export const PORT = 4242;

export const screenshotsPath = path.join(__dirname, './screenshots');

export async function appFactory() {
  return app.listen(PORT);
}

export default appFactory;
