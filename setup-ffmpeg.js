import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import extract from 'extract-zip';

const FFMPEG_URL = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
const FFMPEG_DIR = './ffmpeg';

async function downloadFFmpeg() {
  console.log('Downloading FFmpeg...');

  if (!fs.existsSync(FFMPEG_DIR)) {
    fs.mkdirSync(FFMPEG_DIR, { recursive: true });
  }

  const zipPath = path.join(FFMPEG_DIR, 'ffmpeg.zip');

  // Download
  const response = await fetch(FFMPEG_URL);
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

  await pipeline(response.body, fs.createWriteStream(zipPath));
  console.log('Download complete. Extracting...');

  // Extract
  await extract(zipPath, { dir: path.resolve(FFMPEG_DIR) });
  console.log('Extraction complete.');

  // Clean up zip
  fs.unlinkSync(zipPath);

  // Find bin directory
  const extracted = fs.readdirSync(FFMPEG_DIR);
  const ffmpegFolder = extracted.find(f => f.startsWith('ffmpeg-'));

  if (ffmpegFolder) {
    const binPath = path.join(FFMPEG_DIR, ffmpegFolder, 'bin');
    console.log(`\nFFmpeg installed at: ${path.resolve(binPath)}`);
    console.log('Setup complete! Run: npm run render');
  }
}

downloadFFmpeg().catch(console.error);
