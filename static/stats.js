const emotionCounts = {
  'Happy': 0, 'Neutral': 0, 'Sad': 0,
  'Surprise': 0, 'Angry': 0, 'Fear': 0, 'Disgust': 0
};

// Simulate real-time updates every second
setInterval(() => {
  const emotionKeys = Object.keys(emotionCounts);
  const random = emotionKeys[Math.floor(Math.random() * emotionKeys.length)];
  emotionCounts[random]++;
  updateDashboard();
}, 1000);

function updateDashboard() {
  for (let key in emotionCounts) {
    document.getElementById('count-' + key).innerText = emotionCounts[key];
  }

  barChart.data.datasets[0].data = Object.values(emotionCounts);
  barChart.update();

  pieChart.data.datasets[0].data = Object.values(emotionCounts);
  pieChart.update();
}

// Bar Chart
const barCtx = document.getElementById('emotionBarChart').getContext('2d');
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: Object.keys(emotionCounts),
    datasets: [{
      label: 'Emotions Detected',
      data: Object.values(emotionCounts),
      backgroundColor: [
        '#00d9ff', '#5edfff', '#9f9fff',
        '#fbc6ff', '#ff7e7e', '#ffc46b', '#87ff8f'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Pie Chart
const pieCtx = document.getElementById('emotionPieChart').getContext('2d');
const pieChart = new Chart(pieCtx, {
  type: 'doughnut',
  data: {
    labels: Object.keys(emotionCounts),
    datasets: [{
      data: Object.values(emotionCounts),
      backgroundColor: [
        '#00d9ff', '#5edfff', '#9f9fff',
        '#fbc6ff', '#ff7e7e', '#ffc46b', '#87ff8f'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});
