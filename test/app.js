import { app } from "../src/server/app.js";

export const PORT = 4242;

export const server = await app.listen(PORT);

export default app;
