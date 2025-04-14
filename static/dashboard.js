const barCtx = document.getElementById('barChart').getContext('2d');
const donutCtx = document.getElementById('donutChart').getContext('2d');

const labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];
const data = JSON.parse('{{ counts | tojson | safe }}');

const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: 'Emotion Count',
      data: labels.map(label => data[label] || 0),
      backgroundColor: 'rgba(0, 255, 255, 0.6)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});

const donutChart = new Chart(donutCtx, {
  type: 'doughnut',
  data: {
    labels,
    datasets: [{
      label: 'Emotion Distribution',
      data: labels.map(label => data[label] || 0),
      backgroundColor: [
        '#ff4c4c', '#8aff4c', '#4c6aff',
        '#ffe14c', '#dcdcdc', '#a86aff', '#4cf2ff'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  }
});

// Reset Stats
function resetStats() {
  fetch('/reset', { method: 'POST' }).then(() => location.reload());
}

// Toggle theme
document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
};
