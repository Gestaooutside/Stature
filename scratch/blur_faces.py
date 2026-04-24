import cv2
import sys
import os

def blur_faces_in_image(image_path, output_path):
    print(f"Processando imagem: {image_path}")
    if not os.path.exists(image_path):
        print(f"Erro: Arquivo {image_path} não encontrado.")
        return

    # Usando o classificador em cascata Haar padrão para rostos frontais
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    # Carrega também o classificador de perfil para tentar pegar rostos de lado
    profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

    img = cv2.imread(image_path)
    if img is None:
        print("Erro ao ler a imagem.")
        return

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detecta rostos frontais e de perfil
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    profiles = profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    all_faces = list(faces) + list(profiles)
    
    if len(all_faces) == 0:
        print("Nenhum rosto detectado na imagem (tente borrar manualmente se o rosto estiver muito escondido).")
    
    for (x, y, w, h) in all_faces:
        # Pega a região de interesse (ROI) do rosto
        roi = img[y:y+h, x:x+w]
        # Aplica o desfoque gaussiano
        roi = cv2.GaussianBlur(roi, (99, 99), 30)
        # Substitui a região na imagem original
        img[y:y+h, x:x+w] = roi

    cv2.imwrite(output_path, img)
    print(f"Imagem salva em: {output_path}")

def blur_faces_in_video(video_path, output_path):
    print(f"Processando vídeo: {video_path}")
    if not os.path.exists(video_path):
        print(f"Erro: Arquivo {video_path} não encontrado.")
        return

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Erro ao abrir o vídeo.")
        return

    # Propriedades do vídeo
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(30, 30))
        profiles = profile_cascade.detectMultiScale(gray, 1.1, 4, minSize=(30, 30))
        all_faces = list(faces) + list(profiles)
        
        for (x, y, w, h) in all_faces:
            roi = frame[y:y+h, x:x+w]
            roi = cv2.GaussianBlur(roi, (99, 99), 30)
            frame[y:y+h, x:x+w] = roi
            
        out.write(frame)
        if frame_count % 30 == 0:
            print(f"Processados {frame_count} frames...")

    cap.release()
    out.release()
    print(f"Vídeo salvo em: {output_path}")

if __name__ == "__main__":
    base_dir = r"C:\Users\Steam\Desktop\Statura\public\pacientes"
    
    img_path = os.path.join(base_dir, "fisio-precoce.jpeg")
    img_out = os.path.join(base_dir, "fisio-precoce-blurred.jpeg")
    
    vid_path = os.path.join(base_dir, "trabalho-normal.mp4")
    vid_out = os.path.join(base_dir, "trabalho-normal-blurred.mp4")
    
    blur_faces_in_image(img_path, img_out)
    print("-" * 40)
    blur_faces_in_video(vid_path, vid_out)
    print("Processo concluído.")
