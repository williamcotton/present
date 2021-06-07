import { app } from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = 4200;
const server = app.listen(PORT);
console.debug(`Server running on port ${PORT}`);
process.on("SIGTERM", () => server.close());
