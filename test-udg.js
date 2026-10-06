import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing new UDG style MV...');
console.log('Opening browser to verify visual style...\n');

const browser = await puppeteer.launch({
  headless: false, // Show browser to see the result
  args: ['--window-size=1920,1080']
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

const htmlPath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
console.log(`Loading: ${htmlPath}`);
await page.goto(htmlPath, { waitUntil: 'networkidle0' });

console.log('\nTesting different time points:');
console.log('- 0s: Geometric shapes with light gray background');
await page.evaluate(() => { window.time = 0; });
await new Promise(r => setTimeout(r, 3000));

console.log('- 15s: Cyan background transition');
await page.evaluate(() => { window.time = 15; });
await new Promise(r => setTimeout(r, 3000));

console.log('- 25s: First lyric with overlapping text effects');
await page.evaluate(() => { window.time = 25; });
await new Promise(r => setTimeout(r, 3000));

console.log('- 45s: Purple/pink phase with tunnel visuals');
await page.evaluate(() => { window.time = 45; });
await new Promise(r => setTimeout(r, 3000));

console.log('- 65s: Rainbow colors with particles');
await page.evaluate(() => { window.time = 65; });
await new Promise(r => setTimeout(r, 3000));

console.log('- 75s: Neon yellow/green background');
await page.evaluate(() => { window.time = 75; });
await new Promise(r => setTimeout(r, 3000));

console.log('\nVisual test complete!');
console.log('Check if the style matches UDG aesthetic.');
console.log('Press Ctrl+C when done reviewing.');

// Keep browser open
await new Promise(() => {});
