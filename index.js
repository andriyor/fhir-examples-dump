const fs = require('fs');
const path = require('path');

const delay = require("delay");
const { chromium } = require('playwright-chromium');


(async () => {
  const browser = await chromium.launch({headless: false});
  const page = await browser.newPage();

  const url = 'https://www.hl7.org/fhir/medicationstatement-examples.html';
  const name = url.split('/')[4].replace('.html', '');

  await page.goto(url);
  const exampleUrls = await page.evaluate(() => {
    const tableTr = [...document.querySelectorAll(".list tbody tr")];
    const trimTable = tableTr.slice(1, tableTr.length - 1);
    return trimTable.map((tr) => tr.querySelectorAll("td a")[2].getAttribute('href'));
  })

  for (const exampleUrl of exampleUrls) {
    await page.goto(`https://www.hl7.org/fhir/${exampleUrl}`);
    const json = await page.evaluate(() => {
      return document.querySelector(".json").textContent;
    })
    console.log(exampleUrl);
    fs.mkdirSync(path.resolve(__dirname, 'data', name), { recursive: true });
    fs.writeFileSync(path.resolve(__dirname, 'data', name, `${exampleUrl}.json`), json)
    await delay(500);
  }

  // await browser.close();
})();
