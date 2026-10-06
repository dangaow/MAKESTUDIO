import cv2
import os

videos = [
    "41771274178-1-192.MP4",
    "LUVMEBACK hyperpopginseng type beat.MP4",
    "ginsengmisogipinknoise type beat（也许是吧hhh.MP4"
]

base_path = r"f:\DOWNLOAD\make\MAKESTUDIO\sucai"
output_dir = r"f:\DOWNLOAD\make\MAKESTUDIO\video_frames"

for video in videos:
    video_path = os.path.join(base_path, video)
    cap = cv2.VideoCapture(video_path)

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Extract 3 frames per video
    for i, pos in enumerate([0.3, 0.5, 0.7]):
        frame_num = int(total_frames * pos)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()

        if ret:
            safe_name = video.replace(" ", "_").replace("（", "").replace("）", "")[:30]
            output_path = os.path.join(output_dir, f"{safe_name}_{i}.jpg")
            cv2.imwrite(output_path, frame)
            print(f"Extracted {safe_name} frame {i+1}/3")

    cap.release()

print("Done!")
