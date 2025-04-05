from flask import Flask, render_template, request, jsonify
from keras.models import load_model
import numpy as np
import cv2
import base64
import io
from PIL import Image

app = Flask(__name__)

# ✅ Load model and face cascade only once
model = load_model('model_file_30epochs.h5')
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data_url = request.json['image']
        encoded = data_url.split(',')[1]
        decoded = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(decoded)).convert('RGB')
        open_cv_image = np.array(img)
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return jsonify({'emotion': 'No face detected'})

        x, y, w, h = faces[0]
        roi = gray[y:y + h, x:x + w]
        roi = cv2.resize(roi, (48, 48))
        roi = roi.astype('float32') / 255.0
        roi = np.expand_dims(roi, axis=0)
        roi = np.expand_dims(roi, axis=-1)

        prediction = model.predict(roi)[0]
        emotion = emotion_labels[np.argmax(prediction)]

        return jsonify({'emotion': emotion})

    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({'emotion': 'Error detecting emotion'})

if __name__ == '__main__':
    app.run(debug=True)
