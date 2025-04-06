from flask import Flask, render_template, request, jsonify
from keras.models import load_model
import numpy as np
import cv2
import base64
import io
from PIL import Image
import os

app = Flask(__name__)

# Load the trained model
model = load_model('model_file_30epochs.h5')

# Load Haar Cascade
HAAR_PATH = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
face_cascade = cv2.CascadeClassifier(HAAR_PATH)

if face_cascade.empty():
    print("❌ Haar cascade failed to load!")

# Emotion labels used during training
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Decode base64 image from JS
        data_url = request.json['image']
        encoded = data_url.split(',')[1]
        decoded = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(decoded)).convert('RGB')
        open_cv_image = np.array(img)

        # Convert to grayscale since model was trained on grayscale images
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2GRAY)

        # Improve face detection accuracy
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,
            minNeighbors=2,
            minSize=(20, 20)
        )

        print("✅ Faces found:", len(faces))

        if len(faces) == 0:
            return jsonify({'emotion': 'No face detected'})

        # Take first face found
        x, y, w, h = faces[0]
        roi = gray[y:y + h, x:x + w]

        # Resize and normalize ROI
        roi = cv2.resize(roi, (48, 48))
        roi = roi.astype('float32') / 255.0
        roi = np.expand_dims(roi, axis=0)
        roi = np.expand_dims(roi, axis=-1)

        # Predict emotion
        prediction = model.predict(roi)[0]
        emotion = emotion_labels[np.argmax(prediction)]

        # Optionally log top 2 predictions
        top2 = sorted(zip(emotion_labels, prediction), key=lambda x: x[1], reverse=True)[:2]
        print(f"🎯 Prediction: {emotion} | Top 2: {top2[0][0]}: {top2[0][1]*100:.1f}%, {top2[1][0]}: {top2[1][1]*100:.1f}%")

        return jsonify({'emotion': emotion})

    except Exception as e:
        print("❌ Prediction error:", str(e))
        return jsonify({'emotion': 'Error detecting emotion'})

if __name__ == '__main__':
    app.run(debug=True)
