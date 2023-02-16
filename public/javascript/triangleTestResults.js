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

// translate what "unique" and "other" mean for each triangle test, by comparing the triangle test's "actual_unique" beer color to the beer key
function translateActualBeers(article, triangleTest) {
  const actual_unique = article.beer_key[triangleTest.actual_unique.color];

  const actual_other = triangleTest.actual_unique.color === 'yellow' ? article.beer_key["blue"] : article.beer_key["yellow"];

  const isCorrect = triangleTest.perceived_unique === triangleTest.actual_unique.cup;

  const perceived_unique = isCorrect ? actual_unique : actual_other;

  const perceived_other = isCorrect ? actual_other : actual_unique;

  return {
    actual_unique,
    actual_other,
    perceived_unique,
    perceived_other
  }
}

// make preferences chart
function graphPreferences(article) {
  const preferences = article.triangle_tests.reduce((acc, curr) => {
    if (!curr.actual_unique) return acc;
    
    const { actual_unique, actual_other } = translateActualBeers(article, curr);

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

  const preferencesSpan = document.getElementById('preferences-stmt');

  const notNoPreference = Object.entries(preferences).filter(pref => pref[0] !== "No Preference");
  const notNoPreferenceCount = notNoPreference.reduce((acc,curr) => acc += curr[1], 0);
  const highestPref = notNoPreference[0][1] > notNoPreference[1][1] ? notNoPreference[0] : notNoPreference[1];

  preferencesSpan.innerText = `Of the people who detected a difference, ${highestPref[1] / notNoPreferenceCount * 100}% preferred the "${highestPref[0]}" beer`;

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

// graph a comparison of the 2 beers
function graphComparison(article) {
  const triangleTests = article.triangle_tests;
  // calc the average score for each sensory attribute
  // for any users who detected a difference
  // baseline is 2.  2 === the beers are equal
  const averages = triangleTests
    .reduce((acc, curr) => {
      if (curr.preference === 'none') return acc;
      if (!curr.actual_unique) return acc;

      const { actual_unique, actual_other } = translateActualBeers(article, curr);

      const isCorrect = curr.perceived_unique === curr.actual_unique.cup;

      // calc running avg of each attribute
      // https://math.stackexchange.com/questions/106313/regular-average-calculated-accumulatively
      for (const key of Object.keys(acc[article["beer_key"]["blue"]].attrs)) {
        // unique beer is rated higher
        if (curr[key] <= 2) {
          // if they guessed the unique beer correctly
          if (isCorrect) {
            acc[actual_unique]["attrs"][key] = ((acc[actual_unique].count-1) * acc[actual_unique]["attrs"][key] + Math.abs(curr[key] - 2)) / acc[actual_unique].count;
          }
          // if they guessed the unique beer incorrectly
          else {
            acc[actual_other]["attrs"][key] = ((acc[actual_other].count-1) * acc[actual_other]["attrs"][key] + Math.abs(curr[key] - 2)) / acc[actual_other].count;
          }
        }
        // "other" beer is rated higher
        else {
          // if they guessed the unique beer correctly
          if (isCorrect) {
            acc[actual_other]["attrs"][key] = ((acc[actual_other].count-1) * acc[actual_other]["attrs"][key] + Math.abs(curr[key] - 2)) / acc[actual_other].count;
          }
          // if they guessed the unique beer incorrectly
          else {
            acc[actual_unique]["attrs"][key] = ((acc[actual_unique].count-1) * acc[actual_unique]["attrs"][key] + Math.abs(curr[key] - 2)) / acc[actual_unique].count;
          }
        }        
        // acc[key] = ((count-1) * acc[key] + curr[key]) / count;
      }
      // update count
      acc[actual_unique].count++;
      acc[actual_other].count++;

      return acc;
    }, 
    // initialize an object of average attribute ratings for each beer
    {
      [ article["beer_key"]["blue"] ]: {
        count: 1,
        attrs: {
          balance: 0,
          bitterness: 0,
          malt_character: 0,
          yeast_character: 0,
          body: 0,
          carbonation: 0,
        }
      },
      [ article["beer_key"]["yellow"] ]: {
        count: 1,
        attrs: {
          malt_character: 0,
          yeast_character: 0,
          bitterness: 0,
          balance: 0,
          body: 0,
          carbonation: 0,
        }
      },
    });

    // console.log(averages)

  const comparisonCanvas = document.getElementById("comparison");

  const comparisonChartData = {
    labels: Object.keys(averages[Object.keys(averages)[0]].attrs)
      .map(attr => {
        return capitalizeFirst(attr).replace("_", " ");
      }),
    datasets: [{
      label: Object.keys(averages)[0],
      display: false,
      data: Object.values(Object.values(averages)[0].attrs),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
      ],
      borderColor: [
        'rgb(255, 99, 132)',
      ],
      borderWidth: 1,
      hoverOffset: 50
    },
    {
      label: Object.keys(averages)[1],
      display: false,
      data: Object.values(Object.values(averages)[1].attrs),
      backgroundColor: [
        'rgba(54, 162, 235, 0.2)',
      ],
      borderColor: [
        'rgb(54, 162, 235)',
      ],
      borderWidth: 1,
      hoverOffset: 50
    }],
  }

  const comparisonChartOptions = {
    clip: false,
    responsive: true,
    layout: {
      padding: 50,
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(255 255 255 / 0.5)',
          font: {
            size: 16
          }
        },
      },
      y: {
        title: {
          display: true,
          text: 'More ⇢',
          font: {
            size: 16,
          },
          color: 'rgb(255 255 255 / 0.5)'
        },
        ticks: {
          display: false,
        }
      }
    },
    animation: {
      animateScale: true
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 16
          },
        }
      },
      deferred: {
          xOffset: 150,  // defer until 150px of the canvas width are inside the viewport
          yOffset: '50%',  // defer until 50% of the canvas height are inside the viewport
          delay: 250  // delay of 500 ms after the canvas is considered inside the viewport
      }
    },
  };

  makeChart(comparisonCanvas, 'bar', comparisonChartData, comparisonChartOptions);
}

// visualize off-flavours detected
function graphFlaws(article) {
  const flawsTable = document.querySelector('#flaws-table');
  
  const flaws = article.triangle_tests.reduce((acc, curr) => {
    if (!curr.actual_unique) return acc;
    if (!curr.flaws_detected) return acc;
    
    const { perceived_unique, perceived_other } = translateActualBeers(article, curr);

    for (const [flaw, beers] of Object.entries(curr.flaws)) {
      if (acc[flaw] === undefined && beers.length) acc[flaw] = {};
      for (const beer of beers) {
        if (beer.toLowerCase() === 'unique') {
          if (acc[flaw][perceived_unique] === undefined) {
            acc[flaw][perceived_unique] = 0;
          }
          acc[flaw][perceived_unique]++;
        }
        else if (beer.toLowerCase() === 'other') {
          if (acc[flaw][perceived_other] === undefined) {
            acc[flaw][perceived_other] = 0;
          }
          acc[flaw][perceived_other]++;
        }
        else {
          makeAlert('Unknown beer label in flaws array');
        }
      }
    }
    return acc;
  }, {});
  console.log(flaws);
  
  function makeTableCell(content, classNames=[]) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.innerText = content;
    for (const name of classNames) {
      cell.classList.add(name);
    }
    return cell;
  }
  
  flawsTable.appendChild(makeTableCell(Object.values(article.beer_key)[0], ['heading']));
  flawsTable.appendChild(makeTableCell(Object.values(article.beer_key)[1], ['heading']));
  
  for (const [flaw, beers] of Object.entries(flaws)) {
    // needs refining, should only add a row
    flawsTable.appendChild(makeTableCell(capitalizeFirst(flaw)));
    flawsTable.appendChild(makeTableCell(beers[Object.values(article.beer_key)[0]] || "-"))
    flawsTable.appendChild(makeTableCell(beers[Object.values(article.beer_key)[1]] || "-"))
  }

}

// utility function to make a chart.js graph
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

async function getArticle() {
  try {
    const slug = window.location.href.split('/').at(-2);
    const response = await fetch(`/api/get-article/${slug}`);
    const article = await response.json();
    console.log(article);

    graphDemographics(article);
    graphPreferences(article);
    graphComparison(article);
    graphFlaws(article);

  }
  catch(err) {
    console.error(err);
  }
}


getArticle()