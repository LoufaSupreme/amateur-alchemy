// make demographics chart
function graphDemographics(article) {
  const triangleTests = article.triangle_tests;

  const demographics = triangleTests.reduce((acc, curr) => {
    if (curr.title) {
      if (!acc[curr.title]) acc[curr.title] = []
      acc[curr.title].push(curr.additional_training)
    }
    return acc;
  }, {});

  const demographicsCanvas = document.getElementById("demographics");

  const demographicsChartData = {
    labels: Object.keys(demographics).map(key => {
      if (key === 'enthusiast') return 'Craft Enthusiast';
      if (key === 'bjcp-mid') return 'BJCP Judge';
      if (key === 'bjcp-max') return 'BJCP Master';
      if (key === 'homebrewer') return 'Homebrewer';
      return "Unknown Category"
    }),
    datasets: [{
      label: 'Demographics',
      display: false,
      data: Object.values(demographics).map(demo => demo.length),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1,
      hoverOffset: 50
    }],
  }

  const demographicChartOptions = {
    clip: false,
    responsive: true,
    layout: {
      padding: 50,
    },
    animation: {
      animateScale: true
    },
    plugins: {
      legend: {
        display: false
      },
      deferred: {
          xOffset: 150,  // defer until 150px of the canvas width are inside the viewport
          yOffset: '50%',  // defer until 50% of the canvas height are inside the viewport
          delay: 250  // delay of 500 ms after the canvas is considered inside the viewport
      }
    },
  };

  makeChart(demographicsCanvas, 'bar', demographicsChartData, demographicChartOptions);
}

// make preferences chart
function graphPreferences(article) {
  const preferences = article.triangle_tests.reduce((acc, curr) => {
    const actual_unique = article.beer_key[curr.actual_unique.color];
    const actual_other = curr.actual_unique.color === 'yellow' ? article.beer_key["blue"] : article.beer_key["yellow"];

    if (!curr.actual_unique) return acc;
    const isCorrect = curr.perceived_unique === curr.actual_unique.cup;

    if (curr.preference === 'unique') {
      isCorrect ? acc[actual_unique] += 1 : acc[actual_other] += 1;
    }
    else if (curr.preference === 'other') {
      isCorrect ? acc[actual_other] += 1 : acc[actual_unique] += 1;
    }
    else {
      acc["No Preference"] += 1;
    }
    return acc;

  }, {
    [ article["beer_key"]["blue"] ]: 0,
    [ article["beer_key"]["yellow"] ]: 0,
    "No Preference": 0,
  });

  const preferencesCanvas = document.getElementById('preferences');

  const preferencesChartData = {
    labels: Object.keys(preferences),
    datasets: [{
      label: 'Preferences',
      display: true,
      data: Object.values(preferences),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1,
      hoverOffset: 50
    }],
  }

  const preferencesChartOptions = {
    clip: false,
    responsive: true,
    layout: {
      padding: 50,
    },
    animation: {
      animateScale: true
    },
    plugins: {
      legend: {
        display: true
      },
      deferred: {
          xOffset: 150,  // defer until 150px of the canvas width are inside the viewport
          yOffset: '50%',  // defer until 50% of the canvas height are inside the viewport
          delay: 250  // delay of 500 ms after the canvas is considered inside the viewport
      }
    },
  };

  makeChart(preferencesCanvas, 'doughnut', preferencesChartData, preferencesChartOptions);
}

async function getArticle() {
  try {
    const slug = window.location.href.split('/').at(-2);
    const response = await fetch(`/api/get-article/${slug}`);
    const article = await response.json();
    console.log(article);

    graphDemographics(article);
    graphPreferences(article);

  }
  catch(err) {
    console.error(err);
  }
}

function makeChart(canvas, type, data, options=null) {
  
  const ctx = canvas.getContext('2d');
  
  // make new chart
  const myChart = new Chart(ctx, {
    type: type,
    plugins: [ChartDeferred],
    data: data,
    options: options
  });
}

getArticle()