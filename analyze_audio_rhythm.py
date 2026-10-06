import subprocess
import json
import os

# Get audio info using ffprobe
audio_path = r"f:\DOWNLOAD\make\MAKESTUDIO\sucai\jerk.mp3"
ffprobe_path = r"f:\DOWNLOAD\make\MAKESTUDIO\ffmpeg\ffmpeg-9.0.2-essentials_build\bin\ffprobe.exe"

# Get basic audio info
result = subprocess.run([
    ffprobe_path,
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    audio_path
], capture_output=True, text=True)

data = json.loads(result.stdout)

print("=== Audio Analysis ===")
print(f"Duration: {float(data['format']['duration']):.2f}s")
print(f"Bit rate: {int(data['format']['bit_rate']) // 1000}kbps")

# Get stream info
for stream in data['streams']:
    if stream['codec_type'] == 'audio':
        print(f"Codec: {stream['codec_name']}")
        print(f"Sample rate: {stream['sample_rate']}Hz")
        print(f"Channels: {stream['channels']}")

print("\n=== Lyric Timeline ===")
lyrics = """[00:21.928]我试着不去猜
[00:23.120]我试着不去期待
[00:24.409]好像又遭遇些
[00:25.560]你故意清除的空白
[00:27.002]我没有质疑你
[00:28.401]只是问题在这
[00:29.695]可是你把它当作
[00:30.799]我和你最后决赛
[00:32.541]别让我在你面前
[00:33.771]就失态
[00:34.987]别对我敲连击
[00:36.065]把我击倒
[00:37.375]不要这样就
[00:38.641]不要躲着我
[00:39.888]就别抱紧我
[00:41.126]woah
[00:42.421]你总说你没有做
[00:43.356]你总说你拯救我
[00:44.910]全都是bullshxt
[00:45.959]你从来没救赎过
[00:47.422]逃避的人是我
[00:48.523]不说话的也是我
[00:49.784]好像什么都是我
[00:51.077]好像什么都该我
[00:52.901]别让我在你面前
[00:54.223]就失态
[00:55.421]别对我敲连击
[00:56.408]把我击倒
[00:57.753]不要这样就
[00:59.071]不要躲着我
[01:00.346]就别抱紧我
[01:01.611]woah
[01:03.481]好像我们曾经相识
[01:05.357]好像很久很久我们就已相识
[01:07.937]可我们还要伤害彼此像是将士
[01:10.353]你自己也不知道自己会变这样子
[01:13.256]我的心像大雨落下
[01:15.875]你对我说的话有真有假
[01:18.781]就别再想着跟我说谎话"""

# Analyze rhythm structure
lines = [l for l in lyrics.split('\n') if l.strip()]
timestamps = []
for line in lines:
    if ']' in line:
        time_str = line.split(']')[0].replace('[', '')
        parts = time_str.split(':')
        seconds = float(parts[0]) * 60 + float(parts[1])
        timestamps.append(seconds)

print(f"Total lyric lines: {len(timestamps)}")
print(f"Lyric start: {timestamps[0]:.2f}s")
print(f"Lyric end: {timestamps[-1]:.2f}s")
print(f"Average gap: {(timestamps[-1] - timestamps[0]) / len(timestamps):.2f}s")

# Analyze rhythm patterns
print("\n=== Rhythm Patterns ===")
gaps = []
for i in range(1, len(timestamps)):
    gap = timestamps[i] - timestamps[i-1]
    gaps.append(gap)

import statistics
avg_gap = statistics.mean(gaps)
print(f"Average line gap: {avg_gap:.3f}s")
print(f"Fastest transition: {min(gaps):.3f}s")
print(f"Slowest transition: {max(gaps):.3f}s")

# Identify rapid sections (fast rap)
rapid_sections = []
for i, gap in enumerate(gaps):
    if gap < 1.5:
        rapid_sections.append((timestamps[i], timestamps[i+1]))

print(f"\nRapid sections (< 1.5s gaps): {len(rapid_sections)}")
print("These need faster visual changes!")

# Key moments (longer pauses = emphasis)
pauses = [(timestamps[i], gap) for i, gap in enumerate(gaps) if gap > 2.0]
print(f"\nKey emphasis moments (> 2.0s pauses): {len(pauses)}")
for ts, pause in pauses[:5]:
    print(f"  {ts:.2f}s - {pause:.2f}s pause")
