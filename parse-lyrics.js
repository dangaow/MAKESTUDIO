import fs from 'fs';

// Parse LRC format lyrics
function parseLyrics(lrcContent) {
  const lines = lrcContent.split('\n');
  const lyrics = [];

  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+\.\d+)\]\s*(.+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      const time = minutes * 60 + seconds;

      lyrics.push({ time, text });
    }
  }

  return lyrics.sort((a, b) => a.time - b.time);
}

const lrcContent = fs.readFileSync('./sucai/geci.txt', 'utf-8');
const lyrics = parseLyrics(lrcContent);

console.log('Parsed lyrics:');
console.log(JSON.stringify(lyrics, null, 2));

// Write to JSON file
fs.writeFileSync('./lyrics.json', JSON.stringify(lyrics, null, 2));
console.log('\nLyrics saved to lyrics.json');
