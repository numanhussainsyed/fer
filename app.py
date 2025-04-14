from flask import Flask, render_template, request, jsonify
from keras.models import load_model
import numpy as np
import cv2
import base64
import io
import json
from PIL import Image
from datetime import datetime
import os

app = Flask(__name__)

model = load_model('model_file_30epochs.h5')
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
emoji_map = {
    'Angry': '😠', 'Disgust': '🤢', 'Fear': '😨',
    'Happy': '😄', 'Neutral': '😐', 'Sad': '😢', 'Surprise': '😲'
}

COUNTS_FILE = 'emotion_counts.json'
HISTORY_FILE = 'emotion_history.json'

def load_counts():
    if os.path.exists(COUNTS_FILE):
        with open(COUNTS_FILE, 'r') as f:
            return json.load(f)
    return {emotion: 0 for emotion in emotion_labels}

def save_counts(counts):
    with open(COUNTS_FILE, 'w') as f:
        json.dump(counts, f)

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f)

counts = load_counts()
history = load_history()

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/live')
def live():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    with open('emotion_counts.json') as f:
        counts = json.load(f)
    with open('emotion_history.json') as f:
        history = json.load(f)
    return render_template('dashboard.html', counts=counts, history=history)


@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        print("📩 New Contact:", name, email, message)
        return render_template('contact.html', success=True)
    return render_template('contact.html')

@app.route('/reset', methods=['POST'])
def reset():
    global counts, history
    counts = {emotion: 0 for emotion in emotion_labels}
    history = []
    save_counts(counts)
    save_history(history)
    return ('', 204)

@app.route('/predict', methods=['POST'])
def predict():
    global counts, history
    try:
        data_url = request.json['image']
        encoded = data_url.split(',')[1]
        decoded = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(decoded)).convert('RGB')
        open_cv_image = np.array(img)
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2GRAY)

        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(40, 40))

        if len(faces) == 0:
            return jsonify({'emotion': 'No face detected 😶'})

        x, y, w, h = faces[0]
        roi = gray[y:y + h, x:x + w]
        roi = cv2.resize(roi, (48, 48))
        roi = roi.astype('float32') / 255.0
        roi = np.expand_dims(roi, axis=0)
        roi = np.expand_dims(roi, axis=-1)

        prediction = model.predict(roi, verbose=0)[0]
        emotion = emotion_labels[np.argmax(prediction)]
        emoji = emoji_map.get(emotion, '')

        counts[emotion] += 1
        history.append({
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'emotion': emotion
        })
        save_counts(counts)
        save_history(history[-100:])

        return jsonify({'emotion': f'{emoji} {emotion}'})
    except Exception as e:
        print("❌ Prediction error:", e)
        return jsonify({'emotion': 'Error detecting emotion'})

if __name__ == '__main__':
    app.run(debug=True)
