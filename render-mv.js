import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CONFIGURATION ===
const FPS = 30;
const DURATION = 85; // Audio duration is 130s, but lyrics end at ~79s, add buffer
const TOTAL_FRAMES = FPS * DURATION;
const OUTPUT_DIR = path.join(__dirname, 'frames');
const FFMPEG_PATH = path.join(__dirname, 'ffmpeg', 'ffmpeg-9.0.2-essentials_build', 'bin', 'ffmpeg.exe');
const AUDIO_PATH = path.join(__dirname, 'sucai', 'jerk.mp3');

console.log('=== Lyric MV Renderer (UDG Style) ===');
console.log(`FPS: ${FPS}`);
console.log(`Duration: ${DURATION}s`);
console.log(`Total frames: ${TOTAL_FRAMES}`);
console.log('');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Created frames directory');
} else {
  // Clean existing frames
  console.log('Cleaning existing frames...');
  const files = fs.readdirSync(OUTPUT_DIR);
  let cleaned = 0;
  files.forEach(file => {
    if (file.endsWith('.png')) {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
      cleaned++;
    }
  });
  if (cleaned > 0) console.log(`Removed ${cleaned} old frames`);
}

console.log('\n=== Phase 1: Launching Browser ===');
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080'
  ]
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

// Load the HTML page
const htmlPath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
console.log(`Loading: ${htmlPath}`);
await page.goto(htmlPath, { waitUntil: 'networkidle0' });

// Wait for scene to initialize
console.log('Waiting for scene initialization...');
await new Promise(resolve => setTimeout(resolve, 3000));

console.log('\n=== Phase 2: Rendering Frames ===');
const startTime = Date.now();
let lastProgressTime = startTime;

for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
  const currentTime = frame / FPS;

  // Set the time in the page
  await page.evaluate((time) => {
    window.time = time;
  }, currentTime);

  // Wait for one frame to render
  await new Promise(resolve => setTimeout(resolve, 100));

  // Take screenshot
  const filename = path.join(OUTPUT_DIR, `frame_${String(frame).padStart(5, '0')}.png`);
  await page.screenshot({
    path: filename,
    type: 'png',
    omitBackground: false
  });

  // Progress update every second or at the end
  const now = Date.now();
  if (now - lastProgressTime >= 1000 || frame === TOTAL_FRAMES - 1) {
    const progress = ((frame + 1) / TOTAL_FRAMES * 100).toFixed(1);
    const elapsed = ((now - startTime) / 1000).toFixed(1);
    const framesPerSec = (frame + 1) / ((now - startTime) / 1000);
    const eta = ((TOTAL_FRAMES - frame - 1) / framesPerSec).toFixed(0);

    process.stdout.write(`\rFrame ${frame + 1}/${TOTAL_FRAMES} (${progress}%) | ${framesPerSec.toFixed(1)} fps | Elapsed: ${elapsed}s | ETA: ${eta}s`);
    lastProgressTime = now;
  }
}

console.log('\n');

await browser.close();

const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Frame rendering complete in ${renderTime}s`);

// === Phase 3: FFmpeg Video Composition ===
console.log('\n=== Phase 3: FFmpeg Video Composition ===');

const videoOutput = path.join(__dirname, 'output_silent.mp4');
const finalOutput = path.join(__dirname, 'final_output.mp4');

// Step 1: Create video from frames
console.log('Step 1: Creating video from frames...');
await new Promise((resolve, reject) => {
  const args = [
    '-y',
    '-framerate', String(FPS),
    '-i', path.join(OUTPUT_DIR, 'frame_%05d.png'),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    videoOutput
  ];

  console.log(`Running: ffmpeg ${args.join(' ')}`);

  const ffmpeg = spawn(FFMPEG_PATH, args);

  let stderrData = '';

  ffmpeg.stderr.on('data', (data) => {
    stderrData += data.toString();
    // Only show progress lines
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.includes('frame=') || line.includes('time=')) {
        process.stdout.write('\r' + line.trim().substring(0, 80));
      }
    });
  });

  ffmpeg.on('close', (code) => {
    console.log('');
    if (code === 0) {
      console.log('Video created successfully');
      resolve();
    } else {
      console.error('FFmpeg stderr:', stderrData);
      reject(new Error(`FFmpeg exited with code ${code}`));
    }
  });
});

// Step 2: Add audio
console.log('\nStep 2: Adding audio track...');
await new Promise((resolve, reject) => {
  const args = [
    '-y',
    '-i', videoOutput,
    '-i', AUDIO_PATH,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalOutput
  ];

  console.log(`Running: ffmpeg ${args.join(' ')}`);

  const ffmpeg = spawn(FFMPEG_PATH, args);

  let stderrData = '';

  ffmpeg.stderr.on('data', (data) => {
    stderrData += data.toString();
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.includes('time=')) {
        process.stdout.write('\r' + line.trim().substring(0, 80));
      }
    });
  });

  ffmpeg.on('close', (code) => {
    console.log('');
    if (code === 0) {
      console.log('Audio added successfully');
      resolve();
    } else {
      console.error('FFmpeg stderr:', stderrData);
      reject(new Error(`FFmpeg exited with code ${code}`));
    }
  });
});

// Cleanup
console.log('\nCleaning up temporary files...');
if (fs.existsSync(videoOutput)) {
  fs.unlinkSync(videoOutput);
  console.log('Removed temporary video file');
}

// Final stats
const finalStats = fs.statSync(finalOutput);
const fileSizeMB = (finalStats.size / (1024 * 1024)).toFixed(2);

console.log('\n=== COMPLETE ===');
console.log(`Output: ${finalOutput}`);
console.log(`File size: ${fileSizeMB} MB`);
console.log(`Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
console.log('\nDone!');
