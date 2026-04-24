import cv2
import numpy as np
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
PROTO_PATH = os.path.join(MODEL_DIR, "deploy.prototxt")
MODEL_PATH = os.path.join(MODEL_DIR, "res10_300x300_ssd_iter_140000.caffemodel")

def detect_faces_dnn(net, frame, conf_threshold=0.3):
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > conf_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            faces.append(box.astype(int))
    return faces

def get_fixed_box(video_path, net):
    cap = cv2.VideoCapture(video_path)
    all_boxes = []
    frame_count = 0
    while frame_count < 150: # Check first 150 frames to find the face
        ret, frame = cap.read()
        if not ret: break
        faces = detect_faces_dnn(net, frame)
        for f in faces:
            all_boxes.append(f)
        frame_count += 1
    cap.release()
    
    if not all_boxes:
        return None
    
    # Calculate the union of all detected boxes to cover the whole movement area
    all_boxes = np.array(all_boxes)
    x1 = np.min(all_boxes[:, 0])
    y1 = np.min(all_boxes[:, 1])
    x2 = np.max(all_boxes[:, 2])
    y2 = np.max(all_boxes[:, 3])
    
    # Add 20% padding
    w = x2 - x1
    h = y2 - y1
    x1 = max(0, x1 - int(w*0.2))
    y1 = max(0, y1 - int(h*0.2))
    x2 = x2 + int(w*0.2)
    y2 = y2 + int(h*0.2)
    
    return (x1, y1, x2, y2)

def apply_fixed_blur(video_path, output_path, box):
    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    temp_path = output_path + ".fixed.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_path, fourcc, fps, (width, height))
    
    x1, y1, x2, y2 = box
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(width, x2), min(height, y2)
    
    print(f"Aplicando blur fixo na área: x={x1}, y={y1} até x={x2}, y={y2}")
    
    while True:
        ret, frame = cap.read()
        if not ret: break
        
        # Apply blur to the fixed box
        roi = frame[y1:y2, x1:x2]
        if roi.size > 0:
            roi = cv2.GaussianBlur(roi, (199, 199), 100)
            frame[y1:y2, x1:x2] = roi
            
        out.write(frame)
        
    cap.release()
    out.release()
    
    # Final convert to H.264
    os.system(f'ffmpeg -y -i "{temp_path}" -c:v libx264 -preset fast -crf 23 -c:a aac -movflags +faststart "{output_path}"')
    os.remove(temp_path)

if __name__ == "__main__":
    net = cv2.dnn.readNetFromCaffe(PROTO_PATH, MODEL_PATH)
    base_dir = r"C:\Users\Steam\Desktop\Statura\public\pacientes"
    vid_path = os.path.join(base_dir, "trabalho-normal.mp4")
    vid_out = os.path.join(base_dir, "trabalho-normal-fixed.mp4")
    
    box = get_fixed_box(vid_path, net)
    if box:
        apply_fixed_blur(vid_path, vid_out, box)
        print("Concluído!")
    else:
        print("Não foi possível detectar um rosto para fixar o blur.")
