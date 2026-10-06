import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FPS = 30;
const DURATION = 85; // seconds (song duration + a bit extra)
const TOTAL_FRAMES = FPS * DURATION;
const OUTPUT_DIR = path.join(__dirname, 'frames');
const FFMPEG_PATH = path.join(__dirname, 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin', 'ffmpeg.exe');

console.log('=== Lyric MV Renderer ===');
console.log(`FPS: ${FPS}`);
console.log(`Duration: ${DURATION}s`);
console.log(`Total frames: ${TOTAL_FRAMES}`);

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  // Clean existing frames
  console.log('Cleaning existing frames...');
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(file => {
    if (file.endsWith('.png')) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
  });
}

console.log('\nLaunching browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu'
  ]
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Load the HTML page
const htmlPath = 'file:///' + path.join(__dirname, 'lyric-mv.html').replace(/\\/g, '/');
console.log(`Loading: ${htmlPath}`);
await page.goto(htmlPath);

// Wait for scene to initialize
await new Promise(resolve => setTimeout(resolve, 2000));

console.log('\nRendering frames...');
const startTime = Date.now();

for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
  const currentTime = frame / FPS;

  // Set the time in the page
  await page.evaluate((time) => {
    window.time = time;
  }, currentTime);

  // Wait a bit for render
  await new Promise(resolve => setTimeout(resolve, 50));

  // Take screenshot
  const filename = path.join(OUTPUT_DIR, `frame_${String(frame).padStart(5, '0')}.png`);
  await page.screenshot({
    path: filename,
    type: 'png'
  });

  // Progress update
  if (frame % 30 === 0 || frame === TOTAL_FRAMES - 1) {
    const progress = ((frame + 1) / TOTAL_FRAMES * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const eta = ((Date.now() - startTime) / (frame + 1) * (TOTAL_FRAMES - frame - 1) / 1000).toFixed(1);
    console.log(`Frame ${frame + 1}/${TOTAL_FRAMES} (${progress}%) - Elapsed: ${elapsed}s, ETA: ${eta}s`);
  }
}

await browser.close();

const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\nFrame rendering complete in ${renderTime}s`);

// Now combine with FFmpeg
console.log('\n=== Combining frames with FFmpeg ===');

const videoOutput = path.join(__dirname, 'output_silent.mp4');
const audioPath = path.join(__dirname, 'sucai', 'jerk.mp3');
const finalOutput = path.join(__dirname, 'final_output.mp4');

// Step 1: Create video from frames
console.log('Creating video from frames...');
await new Promise((resolve, reject) => {
  const ffmpeg = spawn(FFMPEG_PATH, [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(OUTPUT_DIR, 'frame_%05d.png'),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    videoOutput
  ]);

  ffmpeg.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  ffmpeg.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      console.log('Video created successfully');
      resolve();
    } else {
      reject(new Error(`FFmpeg exited with code ${code}`));
    }
  });
});

// Step 2: Add audio
console.log('\nAdding audio...');
await new Promise((resolve, reject) => {
  const ffmpeg = spawn(FFMPEG_PATH, [
    '-y',
    '-i', videoOutput,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalOutput
  ]);

  ffmpeg.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  ffmpeg.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      console.log('\n=== COMPLETE ===');
      console.log(`Final video: ${finalOutput}`);
      resolve();
    } else {
      reject(new Error(`FFmpeg exited with code ${code}`));
    }
  });
});

console.log('\nCleaning up temporary files...');
if (fs.existsSync(videoOutput)) {
  fs.unlinkSync(videoOutput);
}

console.log('Done!');
