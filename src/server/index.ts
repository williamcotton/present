import type http from "http";
import { app } from "./app";

const PORT = 4200;

let server: http.Server;

async function startServer() {
  server = app.listen(PORT);
  console.debug(`Server running on port ${PORT}`);
}

process.on("SIGTERM", () => server.close());

startServer();
