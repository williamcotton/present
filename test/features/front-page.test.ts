import tap from "tap";

import { testHarness } from "../test-harness";

tap.test("[server] /", async (t) => {
  const { close, get$ } = await testHarness("server");
  const { $text } = await get$("/");

  t.equal(await $text("h1"), "Hello, World!");

  close();
});

tap.test("[browser] /", async (t) => {
  const { close, get$ } = await testHarness();
  const { $text, screenshot } = await get$("/");

  t.equal(await $text("h1"), "Hello, World!");
  await screenshot("front-page");

  close();
});
