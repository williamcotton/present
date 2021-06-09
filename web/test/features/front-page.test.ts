import tap from "tap";

import { browserHarness, serverHarness } from "../test-harness";

tap.test("[server] /", async (t) => {
  const { close, get$ } = await serverHarness();
  const { $text } = await get$("/");

  t.equal(await $text("h1"), "Hello, World!");

  close();
});

tap.test("[browser] /", async (t) => {
  const { close, get$ } = await browserHarness();
  const { $text, screenshot } = await get$("/");

  t.equal(await $text("h1"), "Hello, World!");
  await screenshot("front-page");

  close();
});
