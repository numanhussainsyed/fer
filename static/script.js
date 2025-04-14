const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const emotionDisplay = document.getElementById('emotion');
const context = canvas.getContext('2d');
const audio = new SpeechSynthesisUtterance();
let isMuted = false;

// -------------------------
// Webcam setup & prediction
// -------------------------
if (video) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
    video.play();
  }).catch(() => {
    emotionDisplay.innerText = "Webcam blocked.";
  });

  setInterval(() => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = canvas.toDataURL('image/jpeg');

    fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: frame })
    })
    .then(res => res.json())
    .then(data => {
      emotionDisplay.innerText = data.emotion || "Detecting...";
      if (!isMuted && data.emotion && !data.emotion.includes('No face')) {
        audio.text = data.emotion;
        speechSynthesis.cancel();
        speechSynthesis.speak(audio);
      }
    })
    .catch(() => {
      emotionDisplay.innerText = "Error detecting emotion";
    });
  }, 800);
}

// -------------------------
// Mute / Unmute toggle
// -------------------------
const soundToggle = document.getElementById('toggle-sound');
if (soundToggle) {
  soundToggle.onclick = function () {
    isMuted = !isMuted;
    this.innerText = isMuted ? '🔇 Unmute' : '🔈 Mute';
  };
}

// -------------------------
// Snapshot capture
// -------------------------
const captureBtn = document.getElementById('capture-btn');
const downloadLink = document.getElementById('download-link');
if (captureBtn && downloadLink) {
  captureBtn.onclick = () => {
    const snapshot = canvas.toDataURL('image/png');
    downloadLink.href = snapshot;
    downloadLink.download = `emotion_snapshot_${Date.now()}.png`;
    downloadLink.click();
  };
}

// -------------------------
// 🌠 SHOOTING STARS
// -------------------------
function createShootingStar() {
  const star = document.createElement('div');
  star.classList.add('shooting-star');
  document.body.appendChild(star);

  star.style.top = `${Math.random() * window.innerHeight}px`;
  star.style.left = `${Math.random() * window.innerWidth * 0.5}px`;

  setTimeout(() => {
    star.remove();
  }, 2000);
}

// Spawn a shooting star every 4–6 seconds
setInterval(() => {
  createShootingStar();
}, 4000 + Math.random() * 2000);
