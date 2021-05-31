import tap from "tap";
import fetch from "node-fetch";
import cheerio from "cheerio";
import { appFactory, PORT } from "../app";

tap.test("test", async (t) => {
  const server = await appFactory();
  const response = await fetch(`http://localhost:${PORT}/`);
  const body = await response.text();
  const $ = cheerio.load(body);
  t.equal($("h1").text(), "Hello, World!");
  server.close();
});
