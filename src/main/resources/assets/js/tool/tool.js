/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
import * as moment from '../../../../../../node_modules/moment/moment';
import * as Chart from '../../../../../../node_modules/chart.js/dist/Chart';
import * as rasa from '../rasa';

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

function splitByField(data, field) {
  const u = {};
  data.forEach((d) => {
    const val = d[field];
    const ud = u[val];
    if (!ud) {
      u[val] = [d];
    } else {
      ud.push(d);
    }
  });
  return u;
}

function calcPrice(price) {
  // eslint-disable-next-line no-nested-ternary
  return price === 'lo' ? 1 : price === 'hi' ? 2 : 0;
}

function calcCuisine(cuisine) {
  return cuisine ? cuisine.length : 0;
}

function calcLocation(location) {
  return location ? location.length : 0;
}

function calcPeople(people) {
  // eslint-disable-next-line radix
  return parseInt(people) || 0;
}

function calcAverage(conversations) {
  const len = conversations.length;
  return conversations.reduce(
    (prev, curr, index) => {
      prev.price += calcPrice(curr.price);
      prev.cuisine += calcCuisine(curr.cuisine);
      prev.location += calcLocation(curr.location);
      prev.people += calcPeople(curr.people);
      if (index === len - 1) {
        prev.price /= len;
        prev.cuisine /= len;
        prev.location /= len;
        prev.people /= len;
      }
      return prev;
    },
    {
      price: 0,
      cuisine: 0,
      location: 0,
      people: 0
    }
  );
}

/*  DOUGHNUT  */

function calcDoughnutData(data) {
  return Object.values(data).map(v => v.length);
}

function calcDoughnutLabels(data) {
  return Object.keys(data);
}

function createDoughnutChart(id, title, rawData, field) {
  const splitData = splitByField(rawData, field);
  const data = calcDoughnutData(splitData);
  const labels = calcDoughnutLabels(splitData);
  const config = {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data,
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
      labels
    },
    options: {
      responsive: true,
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title,
        fontFamily: "Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 16
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, config);
}

/*  BAR   */

function calcDateRange(date, range) {
  let result;
  const mom = moment(date);
  switch (range) {
    case 'D':
      result = mom.format('ddd');
      break;
    case 'M':
      result = mom.format('MMM');
      break;
    case 'W':
    default:
      result = `Week ${mom.week()}`;
      break;
  }
  return result;
}

function splitByDate(data, range) {
  const u = {};
  data.forEach((d) => {
    const val = calcDateRange(d.created, range);
    const ud = u[val];
    if (!ud) {
      u[val] = [d];
    } else {
      ud.push(d);
    }
  });
  return u;
}

function createBarChart(id, title, rawData) {
  const dataByDate = splitByDate(rawData, 'D');
  const averagesByDate = {};
  Object.keys(dataByDate).forEach((dateKey, index) => {
    averagesByDate[dateKey] = calcAverage(dataByDate[dateKey]);
  });

  const datasets = Object.keys(Object.values(averagesByDate)[0]).reduce(
    (prev, fieldKey, index) => {
      const color = Object.values(chartColors)[
        index % Object.keys(chartColors).length
      ];
      const data = Object.values(averagesByDate).map(av => av[fieldKey]);
      prev.push({
        label: fieldKey,
        backgroundColor: color,
        data
      });
      return prev;
    },
    []
  );

  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: calcDoughnutLabels(dataByDate),
      datasets
    },
    options: {
      title: {
        display: true,
        text: title,
        fontFamily: "Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 16
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
}

/*  RADAR   */

function createRadarChart(id, title, dataByUser) {
  const datasets = Object.keys(dataByUser).map((userId, index) => {
    const conversationsByUser = dataByUser[userId];
    const averageByUser = calcAverage(conversationsByUser);
    const color = Object.values(chartColors)[
      index % Object.keys(chartColors).length
    ];
    return {
      label: userId,
      backgroundColor: Chart.helpers
        .color(color)
        .alpha(0.2)
        .rgbString(),
      borderColor: color,
      pointBackgroundColor: color,
      data: [
        averageByUser.people,
        averageByUser.location,
        averageByUser.cuisine,
        averageByUser.price
      ]
    };
  });
  const config = {
    type: 'radar',
    data: {
      labels: ['Order size', 'Location', 'Cuisine', 'Price'],
      datasets
    },
    options: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title,
        fontFamily: "Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 16
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
}

function drawCharts(data) {
  const dataByUser = splitByField(data, 'userId');

  createRadarChart('canvas-1', 'Per user', dataByUser);
  createDoughnutChart('canvas-2', 'Cuisine', data, 'cuisine');
  createDoughnutChart('canvas-3', 'Order size', data, 'people');
  createBarChart('canvas-4', 'Histogram', data);

  document.getElementById('conversations_n').innerHTML = data.length;
  document.getElementById('users_n').innerHTML = Object.keys(dataByUser).length;
}

rasa.onResponse((response) => {
  console.log(response.results);
  drawCharts(response.results);
});

window.onload = function () {
  rasa.results();
};
