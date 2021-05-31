import { app } from "./app.js";

const PORT = 4200;

const server = await app.listen(PORT);

console.debug(`Server running on port ${PORT}`);

process.on("SIGTERM", () => server.close());
