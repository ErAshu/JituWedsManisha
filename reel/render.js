const puppeteer = require("puppeteer-core");
const fs = require("fs"), path = require("path");
(async () => {
  const [,, htmlPath, outDir, mode, ...rest] = process.argv;   // mode: "test t1 t2 ..." or "all fps"
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true, dumpio: false, protocolTimeout: 120000, args: ["--allow-file-access-from-files", "--hide-scrollbars", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
  await page.goto("file://" + path.resolve(htmlPath), { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(()=>{}))); });
  await new Promise(r => setTimeout(r, 800));
  const dur = await page.evaluate(() => window.DURATION);
  const times = mode === "test" ? rest.map(Number) : (() => { const fps = +rest[0]; const n = Math.round(dur * fps); return Array.from({ length: n }, (_, i) => i / fps); })();
  let i = 0; const t0 = Date.now();
  for (const t of times) {
    await page.evaluate(ms => window.seek(ms), t * 1000);
    const name = mode === "test" ? `t_${t}.jpg` : `f_${String(i).padStart(5, "0")}.jpg`;
    await page.screenshot({ path: path.join(outDir, name), type: "jpeg", quality: 92 });
    i++;
    if (mode !== "test" && i % 150 === 0) console.log(`${i}/${times.length} frames, ${((Date.now()-t0)/1000).toFixed(0)}s`);
  }
  console.log("done", i, "frames");
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
