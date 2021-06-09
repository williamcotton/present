import tap from "tap";

import { browserHarness } from "../test-harness";

tap.test("[browser] /signup", async (t) => {
  const { close, get$ } = await browserHarness();
  const { $text, screenshot, page } = await get$("/signup");

  await screenshot("signup-index");

  await page.type("#email", "test@test.com");
  await page.type("#name", "Tester");
  await page.$eval("button.submit", (button: any) => button.click());

  t.equal(await $text("h3"), "Tester [test@test.com]");
  await screenshot("signup-confirmation");

  close();
});
