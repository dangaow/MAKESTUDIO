import cv2
import sys
import os

video_path = r"f:\DOWNLOAD\make\MAKESTUDIO\sucai\41389066942-1-192.mp4"
output_dir = r"f:\DOWNLOAD\make\MAKESTUDIO\video_frames"

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
duration = total_frames / fps

print(f"Total frames: {total_frames}")
print(f"FPS: {fps}")
print(f"Duration: {duration:.2f}s")

# Extract frames at key points: start, 25%, 50%, 75%, end
positions = [0, 0.25, 0.5, 0.75, 0.95]

for i, pos in enumerate(positions):
    frame_num = int(total_frames * pos)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
    ret, frame = cap.read()

    if ret:
        output_path = os.path.join(output_dir, f"frame_{i}_{pos*100:.0f}pct.jpg")
        cv2.imwrite(output_path, frame)
        print(f"Extracted frame {i+1}/5 at {pos*100:.0f}%")

cap.release()
print(f"\nFrames saved to: {output_dir}")
