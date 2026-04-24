import cv2
import numpy as np
import os
import urllib.request

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
PROTO_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
MODEL_URL = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"
PROTO_PATH = os.path.join(MODEL_DIR, "deploy.prototxt")
MODEL_PATH = os.path.join(MODEL_DIR, "res10_300x300_ssd_iter_140000.caffemodel")

def ensure_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    if not os.path.exists(PROTO_PATH):
        print("Baixando deploy.prototxt...")
        urllib.request.urlretrieve(PROTO_URL, PROTO_PATH)
    if not os.path.exists(MODEL_PATH):
        print("Baixando modelo DNN (~10 MB)...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Modelos prontos.")

def detect_faces_dnn(net, frame, conf_threshold=0.35):
    """Detecta rostos usando DNN SSD - muito mais robusto que Haar."""
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > conf_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            x1, y1, x2, y2 = box.astype(int)
            # Expandir a caixa em 30% para cobrir mais do rosto/cabelo
            pad_w = int((x2 - x1) * 0.3)
            pad_h = int((y2 - y1) * 0.3)
            x1 = max(0, x1 - pad_w)
            y1 = max(0, y1 - pad_h)
            x2 = min(w, x2 + pad_w)
            y2 = min(h, y2 + pad_h)
            faces.append((x1, y1, x2, y2, confidence))
    return faces

def blur_region(img, x1, y1, x2, y2):
    """Aplica blur gaussiano pesado numa região."""
    roi = img[y1:y2, x1:x2]
    # Blur forte - kernel grande
    roi = cv2.GaussianBlur(roi, (151, 151), 60)
    img[y1:y2, x1:x2] = roi
    return img

def blur_faces_video(net, video_path, output_path):
    print(f"Processando vídeo: {video_path}")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Erro ao abrir o vídeo.")
        return

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Salva temporário com codec mp4v, depois converte com ffmpeg
    temp_path = output_path + ".temp.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_path, fourcc, fps, (frame_width, frame_height))

    frame_count = 0
    blurred_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        faces = detect_faces_dnn(net, frame)
        
        for (x1, y1, x2, y2, conf) in faces:
            frame = blur_region(frame, x1, y1, x2, y2)
            blurred_count += 1
        
        out.write(frame)
        if frame_count % 30 == 0:
            print(f"  Frame {frame_count}/{total_frames} - rostos borrados neste frame: {len(faces)}")

    cap.release()
    out.release()
    print(f"  Total de detecções borradas: {blurred_count} em {frame_count} frames")
    
    # Converte para H.264 com ffmpeg
    print("  Convertendo para H.264 (compatível com browser)...")
    os.system(f'ffmpeg -y -i "{temp_path}" -c:v libx264 -preset fast -crf 23 -c:a aac -movflags +faststart "{output_path}"')
    os.remove(temp_path)
    print(f"Vídeo salvo em: {output_path}")

if __name__ == "__main__":
    ensure_models()
    net = cv2.dnn.readNetFromCaffe(PROTO_PATH, MODEL_PATH)
    
    base_dir = r"C:\Users\Steam\Desktop\Statura\public\pacientes"
    
    # Vídeo
    # Primeiro, precisamos do vídeo ORIGINAL (antes do blur anterior que não funcionou)
    # Como já sobrescrevemos, vamos trabalhar com o que temos
    vid_path = os.path.join(base_dir, "trabalho-normal.mp4")
    vid_out = os.path.join(base_dir, "trabalho-normal-blurred.mp4")
    
    blur_faces_video(net, vid_path, vid_out)
    print("\nProcesso concluído!")
