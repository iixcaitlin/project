function createCharts(radardata, lineData) {
  createRadar(radardata)
  createLine(lineData)
}

function createRadar(data) {
  data = JSON.parse(data)
  var emotions = []
  var emotionValues = []
  for (let emotion in data){
    emotionValues.push(data[emotion])
    emotion = emotion.split(".")[1]
    emotions.push(emotion)
  }
  new Chart(
    document.getElementById('emotions'), {
    type: 'radar',
      data: {
        labels: emotions,
        datasets: [{
            label: "emotions",
            data: emotionValues,
            backgroundColor: ['#BEE9E8'],
            borderColor: ['#62B6CB']
        }],
      },
      options: {
        responsive: false,
        elements: {
            line: {
              borderWidth: 3
            }
        },
        plugins: {
          title: {
            display: true,
            text: "Overall Emotions from Journal Entries"
          },
          legend: {
            position: "bottom"
          }
        }
      },
    }
  );
}

function createLine(data) {
  data = JSON.parse(data)
  var dates = []
  var sentiments = []
  for (var date in data) {
    dates.push(date)
    sentiments.push(data[date])
  }
  new Chart(document.getElementById("sentiments"), {
    type: 'line',
    data: {
       labels: dates,
       datasets: [{
          label: "mood",
          data: sentiments,
          backgroundColor: ['#BEE9E8'],
          borderColor: ['#62B6CB']
       }],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Overall Mood in Journal Entries"
        },
        legend: {
          position: "bottom"
        }
       }
    },
 });
}