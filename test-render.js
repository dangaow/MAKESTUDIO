import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FPS = 30;
const DURATION = 5; // Just 5 seconds for testing
const TOTAL_FRAMES = FPS * DURATION;
const OUTPUT_DIR = path.join(__dirname, 'test_frames');

console.log('=== Quick Test Render (5 seconds) ===');
console.log(`Rendering ${TOTAL_FRAMES} frames at ${FPS} fps`);

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(file => {
    if (file.endsWith('.png')) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
  });
}

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1920,1080'
  ]
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

const htmlPath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
console.log(`Loading: ${htmlPath}`);
await page.goto(htmlPath, { waitUntil: 'networkidle0' });

await new Promise(resolve => setTimeout(resolve, 2000));

console.log('Rendering frames...');
const startTime = Date.now();

for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
  const currentTime = frame / FPS;

  await page.evaluate((time) => {
    window.time = time;
  }, currentTime);

  await new Promise(resolve => setTimeout(resolve, 100));

  const filename = path.join(OUTPUT_DIR, `frame_${String(frame).padStart(5, '0')}.png`);
  await page.screenshot({
    path: filename,
    type: 'png'
  });

  process.stdout.write(`\rFrame ${frame + 1}/${TOTAL_FRAMES}`);
}

console.log('\n');
await browser.close();

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Complete in ${elapsed}s`);
console.log(`Frames saved to: ${OUTPUT_DIR}`);
console.log('\nYou can check the first and last frame to verify the visuals.');
