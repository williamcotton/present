import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";
import { app } from "../src/server/app";

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

export const PORT = 4242;

export const baseUrl = `http://localhost:${PORT}`;

export const screenshotsPath = path.join(__dirname, "./screenshots");

export async function browserHarness() {
  const browser = await puppeteer.launch(puppeteerOptions);

  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 1080,
  });

  const server = app.listen(PORT);

  const close = () => {
    page.close();
    browser.close();
    server.close();
  };

  const get$ = async (path: string) => {
    const url = baseUrl + path;
    await page.goto(url);

    const $text = async (selector: string) => {
      await page.waitForSelector(selector);
      return page.evaluate(
        /* istanbul ignore next */
        (_selector) => {
          const element = document.querySelector(_selector);
          return element ? element.innerText : false;
        },
        selector
      );
    };

    const $html = async (selector: string) =>
      page.evaluate(
        /* istanbul ignore next */
        (_selector) => {
          const element = document.querySelector(_selector);
          return element ? element.innerHTML : false;
        },
        selector
      );

    const currentRoute = () => page.url().split(baseUrl)[1];

    const findByText = async (text: string) =>
      page.$x(`//*[contains(., '${text}')]/@*`);

    const getAttr = async (handle: any) => {
      const propertyHandle = await handle.getProperty("value");
      const attr = await propertyHandle.jsonValue();
      return attr;
    };

    const screenshot = async (name: string) => {
      await page.screenshot({
        path: `${screenshotsPath}/${name}.png`,
        fullPage: true,
      });
    };

    return {
      $text,
      currentRoute,
      page,
      findByText,
      getAttr,
      baseUrl,
      $html,
      browser,
      screenshot,
    };
  };

  return { close, get$ };
}

export async function serverHarness() {
  const server = app.listen(PORT);

  const close = () => {
    server.close();
  };

  const get$ = async (path: string) => {
    const url = baseUrl + path;
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);
    const $text = async (selector: string) => $(selector).text();
    return { $text };
  };

  return { close, get$ };
}
