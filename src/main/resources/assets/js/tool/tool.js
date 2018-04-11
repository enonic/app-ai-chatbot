import * as Chart from '../../../../../../node_modules/chart.js/dist/Chart';
import * as rasa from '../rasa';

const randomScalingFactor = function() {
  return Math.round(Math.random() * 100);
};

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

rasa.onResponse(results => {
  console.log(results);
});

rasa.results();

// eslint-disable-next-line func-names
window.createDoughnutChart = function(id, title) {
  const config = {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()
          ],
          backgroundColor: [
            chartColors.red,
            chartColors.orange,
            chartColors.yellow,
            chartColors.green,
            chartColors.blue
          ],
          label: 'Dataset 1'
        }
      ],
      labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue']
    },
    options: {
      responsive: true,
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, config);
};

// eslint-disable-next-line func-names
window.createBarChart = function(id, title) {
  const barChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Dataset 1',
        backgroundColor: chartColors.red,
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ]
      },
      {
        label: 'Dataset 2',
        backgroundColor: chartColors.blue,
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ]
      },
      {
        label: 'Dataset 3',
        backgroundColor: chartColors.green,
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ]
      }
    ]
  };

  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: barChartData,
    options: {
      title: {
        display: true,
        text: title
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            stacked: true
          }
        ],
        yAxes: [
          {
            stacked: true
          }
        ]
      }
    }
  });
};

window.createRadarChart = function(id, title) {
  const config = {
    type: 'radar',
    data: {
      labels: [
        ['Eating', 'Dinner'],
        ['Drinking', 'Water'],
        'Sleeping',
        ['Designing', 'Graphics'],
        'Coding',
        'Cycling',
        'Running'
      ],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: Chart.helpers
            .color(chartColors.red)
            .alpha(0.2)
            .rgbString(),
          borderColor: chartColors.red,
          pointBackgroundColor: chartColors.red,
          data: [
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()
          ]
        },
        {
          label: 'My Second dataset',
          backgroundColor: Chart.helpers
            .color(chartColors.blue)
            .alpha(0.2)
            .rgbString(),
          borderColor: chartColors.blue,
          pointBackgroundColor: chartColors.blue,
          data: [
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()
          ]
        }
      ]
    },
    options: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title
      },
      scale: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  };

  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, config);
};
