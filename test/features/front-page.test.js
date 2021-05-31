import tap from "tap";
import fetch from 'node-fetch';
import { server, PORT } from '../app.js';

tap.test("test", async (t) => {
  const response = await fetch(`http://localhost:${PORT}/`);
  const body = await response.text();
  t.equal(body, 'Hello, World!');
  server.close();
});
