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
  const { $text, screenshot, page, currentRoute } = await get$("/");

  t.equal(await $text("h1"), "Hello, World!");
  await screenshot("front-page");

  await page.type("#email", "test@test.com");
  await page.$eval("button.submit", (button: any) => button.click());

  t.equal(await $text("h3"), "test@test.com");
  t.equal(currentRoute(), "/signup-confirmation?email=test%40test.com");
  await screenshot("signup-confirmation");

  close();
});
