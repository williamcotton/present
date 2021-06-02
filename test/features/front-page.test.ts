import tap from "tap";
import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from "fs";
import puppeteer from "puppeteer";
import { appFactory, PORT, screenshotsPath } from "../app";

const puppeteerOptions: any = {
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--font-render-hinting=none",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--enable-usermedia-screen-capturing",
    // TODO #32: --use-file-for-fake-video-capture=/home/doehlman/testvideo.y4m
  ],
  headless: true,
};

const chromiumPath = "/usr/bin/chromium-browser";
if (fs.existsSync(chromiumPath)) {
  puppeteerOptions.executablePath = chromiumPath;
}

tap.test("[server] /", async (t) => {
  const server = await appFactory();
  const response = await fetch(`http://localhost:${PORT}/`);
  const body = await response.text();
  const $ = cheerio.load(body);
  t.equal($("h1").text(), "Hello, World!");
  server.close();
});

tap.test("[browser] /", async (t) => {
  const server = await appFactory();
  const browser = await puppeteer.launch(puppeteerOptions);

  const $text = async (selector: string) =>
    page.evaluate(
      /* istanbul ignore next */
      (_selector) => {
        const element = document.querySelector(_selector);
        return element ? element.innerText : false;
      },
      selector
    );

  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 1080,
  });

  await page.goto(`http://localhost:${PORT}/`);

  await page.waitForSelector('h1');
  await page.screenshot({
    path: `${screenshotsPath}/front-page.png`,
    fullPage: true,
  });

  t.equal(await $text("h1"), "Hello, World!");

  await page.close();
  await browser.close();
  server.close();
});
