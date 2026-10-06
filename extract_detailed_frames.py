import cv2
import os

def extract_detailed_frames(video_path, output_dir, num_frames=15):
    """Extract more frames from video for detailed analysis"""
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps

    video_name = os.path.splitext(os.path.basename(video_path))[0]

    print(f"\n{video_name}:")
    print(f"  Total frames: {total_frames}")
    print(f"  FPS: {fps}")
    print(f"  Duration: {duration:.2f}s")

    # Extract frames at different points
    frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]

    for i, frame_idx in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if ret:
            timestamp = frame_idx / fps
            output_path = os.path.join(output_dir, f"{video_name}_frame{i:03d}_t{timestamp:.1f}s.jpg")
            cv2.imwrite(output_path, frame)
            print(f"  Extracted frame {i+1}/{num_frames} at {timestamp:.1f}s")

    cap.release()
    return duration

# Create analysis directory
analysis_dir = r"f:\DOWNLOAD\make\MAKESTUDIO\video_analysis"
if not os.path.exists(analysis_dir):
    os.makedirs(analysis_dir)

# Extract detailed frames from all reference videos
video_dir = r"f:\DOWNLOAD\make\MAKESTUDIO\sucai"
video_files = [
    "41389066942-1-192.mp4",
    "41771274178-1-192.MP4",
    "LUVMEBACK hyperpopginseng type beat.MP4",
    "ginsengmisogipinknoise type beat（也许是吧hhh.MP4",
    "天使の泪 BOBBYNOPEACE _ 日语采样 _ Emo piano Type Beat.MP4"
]

print("=== Extracting detailed frames from reference videos ===")
for video_file in video_files:
    video_path = os.path.join(video_dir, video_file)
    if os.path.exists(video_path):
        extract_detailed_frames(video_path, analysis_dir, num_frames=15)
    else:
        print(f"Skipping {video_file} - not found")

print(f"\nAll frames extracted to: {analysis_dir}")
