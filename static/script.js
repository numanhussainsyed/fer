const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const emotionDisplay = document.getElementById('emotion');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Camera Error: " + err.message);
  });

function sendFrame() {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg');

  fetch('/predict', {
    method: 'POST',
    body: JSON.stringify({ image: dataUrl }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    emotionDisplay.innerText = `Emotion: ${data.emotion}`;
  })
  .catch(err => {
    emotionDisplay.innerText = 'Error detecting emotion';
  });

  setTimeout(sendFrame, 1000);
}

video.addEventListener('playing', () => {
  sendFrame();
});
