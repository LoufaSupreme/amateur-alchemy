// make demographics chart
function graphDemographics(article) {
  const triangleTests = article.triangle_tests;

  const demographics = triangleTests.reduce((acc, curr) => {
    // check that the triangle test has a title attribute
    if (curr.title) {
      // group all the cicerones
      if (curr.additional_training.some(elem => elem.includes("cicerone"))) {
        if (!acc["Cicerone"]) acc["Cicerone"] = [];
        acc["Cicerone"].push(curr);
      }
      // group all the advanced BJCP judges
      else if (
        curr.additional_training.some(elem => elem.includes("bjcp-mid")) ||
        curr.additional_training.some(elem => elem.includes("bjcp-max"))
      ) {
        if (!acc["Advanced BJCP Judge"]) acc["Advanced BJCP Judge"] = [];
        acc["Advanced BJCP Judge"].push(curr);
      }
      // group all the beginner judges
      else if (curr.additional_training.some(elem => elem.includes("bjcp"))) {
        if (!acc["BJCP Judge"]) acc["BJCP Judge"] = [];
        acc["BJCP Judge"].push(curr);
      }
      // otherwise just take their title (homebrewer, enthusiast, etc)
      else {
        const title = capitalizeFirst(curr.title);
        if (!acc[title]) acc[title] = [];
        acc[title].push(curr);
      }
    }
    return acc;
  }, {});

  const demographicsCanvas = document.getElementById("demographics");

  const demographicsChartData = {
    labels: Object.keys(demographics),
    datasets: [{
      // label: 'Demographics',
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
      padding: 20,
    },
    animation: {
      animateScale: true
    },
    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold',
          }
        }
      },
      y: {
        ticks: {
          stepSize: 1,
          font: {
            size: Math.min(window.innerWidth * 0.03, 22),
          }
        }
      }
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

  preferencesSpan.innerText = `Of the people who detected a difference, ${(highestPref[1] / notNoPreferenceCount * 100).toFixed(0)}% preferred the "${highestPref[0]}" beer`;

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
      hoverOffset: 20
    }],
  }

  const preferencesChartOptions = {
    clip: false,
    responsive: true,
    layout: {
      padding: 30,
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
  const rangeInputs = document.querySelectorAll('.range-input');
  // calc the average score for each sensory attribute
  // for any users who detected a difference
  // baseline is 2.  2 === the beers are equal
  const averages = triangleTests
    .reduce((acc, curr) => {
      if (curr.preference === 'none') return acc;
      if (!curr.actual_unique) {
        console.error(`Test ${curr.token} is missing a triangle_test_key ("actual_unique")`);
        makeAlert(`Test ${curr.token} is missing an answer key!`)
        return acc;
      }

      const { actual_unique, actual_other } = translateActualBeers(article, curr);

      const isCorrect = curr.perceived_unique === curr.actual_unique.cup;

      // calc running avg of each attribute
      // https://math.stackexchange.com/questions/106313/regular-average-calculated-accumulatively
      // for each beer characteristic: 
      for (const key of Object.keys(acc[article["beer_key"]["blue"]].attrs)) {
        // unique beer is rated higher
        if (curr[key] >= 2) {
          // if they guessed the unique beer correctly
          if (isCorrect) {
            acc[actual_unique]["attrs"][key]["avg"] = ((acc[actual_unique].count-1) * acc[actual_unique]["attrs"][key]["avg"] + Math.abs(curr[key] - 2)) / acc[actual_unique].count;

            acc[actual_unique]["attrs"][key]["ratings"].push(curr[key])
          }
          // if they guessed the unique beer incorrectly
          else {
            acc[actual_other]["attrs"][key]["avg"] = ((acc[actual_other].count-1) * acc[actual_other]["attrs"][key]["avg"] + Math.abs(curr[key] - 2)) / acc[actual_other].count;

            acc[actual_other]["attrs"][key]["ratings"].push(curr[key])
          }
        }
        // "other" beer is rated higher
        else {
          // if they guessed the unique beer correctly
          if (isCorrect) {
            acc[actual_other]["attrs"][key]["avg"] = ((acc[actual_other].count-1) * acc[actual_other]["attrs"][key]["avg"] + Math.abs(curr[key] - 2)) / acc[actual_other].count;

            acc[actual_other]["attrs"][key]["ratings"].push(curr[key])
          }
          // if they guessed the unique beer incorrectly
          else {
            acc[actual_unique]["attrs"][key]["avg"] = ((acc[actual_unique].count-1) * acc[actual_unique]["attrs"][key]["avg"] + Math.abs(curr[key] - 2)) / acc[actual_unique].count;

            acc[actual_unique]["attrs"][key]["ratings"].push(curr[key])
          }
        }
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
          balance: {
            ratings: [],
            avg: 0
          },
          bitterness: {
            ratings: [],
            avg: 0
          },
          malt_character: {
            ratings: [],
            avg: 0
          },
          yeast_character: {
            ratings: [],
            avg: 0
          },
          hop_character: {
            ratings: [],
            avg: 0
          },
          body: {
            ratings: [],
            avg: 0
          },
          carbonation: {
            ratings: [],
            avg: 0
          },
        }
      },
      [ article["beer_key"]["yellow"] ]: {
        count: 1,
        attrs: {
          balance: {
            ratings: [],
            avg: 0
          },
          bitterness: {
            ratings: [],
            avg: 0
          },
          malt_character: {
            ratings: [],
            avg: 0
          },
          yeast_character: {
            ratings: [],
            avg: 0
          },
          hop_character: {
            ratings: [],
            avg: 0
          },
          body: {
            ratings: [],
            avg: 0
          },
          carbonation: {
            ratings: [],
            avg: 0
          },
        }
      },
    }
  );

  function changeRangeInput(input, val) {
    const inputParent = input.closest('.range-input');
    const subheading = inputParent.querySelector('.range-input__subheading');

    const blueBeer = article.beer_key.blue;
    const yellowBeer = article.beer_key.yellow;

    // update range value
    input.value = val;

    // update subheading:
    switch(true) {
      case val > 1:
          subheading.innerText = `The ${blueBeer} beer is MUCH higher in ${subheading.dataset.attr} than the ${yellowBeer} beer.`;
          break;
      case val > 0:
          subheading.innerText = `The ${blueBeer} beer is somewhat higher in ${subheading.dataset.attr} than the ${yellowBeer} beer.`;
          break;
      case val == 0:
          subheading.innerText = `The ${subheading.dataset.attr} is about equal.`;
          break;
      case val < 0:
          subheading.innerText =  `The ${blueBeer} beer is somewhat lower in ${subheading.dataset.attr} than the ${yellowBeer} beer.`;
          break;
      case val < -1:
          subheading.innerText =  `The ${blueBeer} beer is MUCH lower in ${subheading.dataset.attr} than the ${yellowBeer} beer.`
          break;
      default:
          console.error({Error: "Value not recognized", val})
    }
  }

  // for each beer descriptor
  rangeInputs.forEach(range => {
    const rangeInput = range.querySelector('input[type="range"]');
    const descriptor = rangeInput.id; // malt_character, carbonation, etc
    
    // get average of all ratings for this descriptor
    // normalize the ratings b/w -2 and 2
    const blueBeerAvgs = averages[article.beer_key.blue]["attrs"][descriptor]["ratings"]
      .map(rating => rating-2);
    
    const yellowBeerAvgs = averages[article.beer_key.yellow]["attrs"][descriptor]["ratings"]
      .map(rating => rating-2);
    
    // calculate avg for both beers
    let ratings = [blueBeerAvgs, yellowBeerAvgs].flat();
    const sum = ratings.reduce((acc, curr) => acc+=curr,0);
    const avg = (sum / ratings.length).toFixed(1) || 2;
    changeRangeInput(rangeInput, avg);
  })
}

// visualize off-flavours detected
function graphFlaws(article) {
  // const flawsTable = document.querySelector('#flaws-table');
  
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

  const beer1 = Object.values(article.beer_key)[0];
  const beer2 = Object.values(article.beer_key)[1];

  const flawsCanvas = document.getElementById("flaws");
  // flawsCanvas.style.height = `${(Object.keys(flaws).length*5)}rem`
  flawsCanvas.style.height = `${flawsCanvas.parentElement.getBoundingClientRect().width}px`

  const flawsChartData = {
    labels: Object.keys(flaws).map(key => capitalizeFirst(key)),
    datasets: [
      {
        label: beer1,
        // xAxisID: 'top',
        categoryPercentage: 0.5,
        barPercentage: 0.9,
        data: Object.values(flaws).map(elem => elem[beer1]),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
        ],
        borderWidth: 0,
        hoverOffset: 50
      },
      {
        label: beer2,
        // xAxisID: 'top',
        categoryPercentage: 0.5,
        barPercentage: 0.9,
        data: Object.values(flaws).map(elem => elem[beer2]),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgb(54, 162, 235)',
        ],
        borderWidth: 0,
        hoverOffset: 50
      }
    ],
  }

  const flawsChartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    clip: false,
    responsive: true,
    layout: {
      padding: 20,
    },
    animation: {
      animateScale: true
    },
    scales: {
      x: {
        position: 'bottom',
        title: {
          display: true,
          text: "# of People"
        },
        ticks: {
          stepSize: 1
        }
      },
      y: {
        ticks: {
          font: {
            size: Math.min(window.innerWidth * 0.03, 22),
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      deferred: {
          xOffset: 150,  // defer until 150px of the canvas width are inside the viewport
          yOffset: '25%',  // defer until 50% of the canvas height are inside the viewport
          delay: 250  // delay of 500 ms after the canvas is considered inside the viewport
      }
    },
  };

  makeChart(flawsCanvas, 'bar', flawsChartData, flawsChartOptions);

  // console.log(flaws);
  
  // function makeTableCell(content, classNames=[]) {
  //   const cell = document.createElement('div');
  //   cell.classList.add('cell');
  //   cell.innerText = content;
  //   for (const name of classNames) {
  //     cell.classList.add(name);
  //   }
  //   return cell;
  // }

  // const row = document.createElement('div');
  // row.classList.add('row');
  // row.classList.add('headings');
  // row.appendChild(makeTableCell(""));
  // row.appendChild(makeTableCell(Object.values(article.beer_key)[0]));
  // row.appendChild(makeTableCell(Object.values(article.beer_key)[1]));
  // flawsTable.appendChild(row);

  
  // for (const [flaw, beers] of Object.entries(flaws)) {
  //   const row = document.createElement('div');
  //   row.classList.add('row');
  //   row.appendChild(makeTableCell(capitalizeFirst(flaw)));
  //   row.appendChild(makeTableCell(beers[Object.values(article.beer_key)[0]] || "-"))
  //   row.appendChild(makeTableCell(beers[Object.values(article.beer_key)[1]] || "-"))
  //   flawsTable.appendChild(row);
  // }
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
    // const slug = window.location.href.split('/').at(-2);
    const urlComponents = window.location.pathname.split('/');
    const slug = urlComponents[urlComponents.length - 2];
    const response = await fetch(`/api/get-article/${slug}`);
    const article = await response.json();
    // console.log(article);
    return article;

  }
  catch(err) {
    console.error(err);
  }
}

async function displayResults() {
  try {
    const article = await getArticle();
    graphDemographics(article);
    graphPreferences(article);
    graphComparison(article);
    graphFlaws(article);
  }
  catch(err) {
    console.error(err);
  }
}

function resizeFlawsGraph() {
  const flawsCanvas = document.querySelector('#flaws');
  flawsCanvas.style.height = `${flawsCanvas.parentElement.getBoundingClientRect().width}px`;
}

window.addEventListener('resize', resizeFlawsGraph);
displayResults();