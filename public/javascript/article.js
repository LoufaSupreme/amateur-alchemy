//// RADAR CHART


function createChart(container, type) {
    const transparentWhite = 'rgb(255 255 255 / 0.2)';
    const opaqueWhite = 'rgb(255 255 255 / 0.6)';
    // set default chart size for chart.js
    Chart.defaults.font.size = 14;
    
    new Chart(container, {
        type: type,
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function getImageUrl(imgName) {
    const res = await fetch(`/articles/api/getUrl/${imgName}`);
    const url = await res.json();
    return url;
}

async function updateImages() {
    const figures = document.querySelectorAll('figure');
    for (const figure of figures) {
        const img = figure.querySelector('img');
        const url = await getImageUrl(img.dataset.filename);
        img.src = url;
    }
}



// fetch all article details
// returns: article object
async function getArticle() {
    try {
        const urlComponents = window.location.pathname.split('/');
        const slug = urlComponents[urlComponents.length - 1];
        const response = await fetch(`/articles/api/get/${slug}`);
        const article = await response.json();
        return article;
    }
    catch(err) {
        console.error(err);
        makeAlert('No article JSON returned!')
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

// reduce all triangle test respondents by credentials
// inputs: array of triangle tests
// outputs: obj with triangle tests sorted by credential
function gatherDemographics(triangleTests) {
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

    // sort in reverse alphabetical order
    const sortedDemos = Object.entries(demographics).sort((a,b) => {
        return a[0].localeCompare(b[0]);
    }).reverse();

    return sortedDemos;
}

// make demographics chart
function chartDemographics(article) {
    // find chart element
    const demographicsCanvas = document.getElementById("demographics");
    if (!demographicsCanvas) return;

    // get demographics data
    const demographics = gatherDemographics(article.triangle_tests);

    // initialize chart data
    const demographicsChartData = {
        labels: demographics.map(cat => cat[0]),
        datasets: [{
            // label: 'Demographics',
            display: false,
            data: demographics.map(cat => cat[1].length),
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

    // initialize chart options
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

    // add demographic chart top-matter / specs
    // demographicSpecs(article.triangle_tests);

    // create the chart
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
        perceived_other,
        isCorrect
    }
}

// reduce triangle test respondents preferences
function gatherPreferences(article) {
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

    return preferences;
}

// make preferences chart
function chartPreferences(article) {
    const preferences = gatherPreferences(article);
    const preferencesSpan = document.getElementById('preferences-stmt');

    const notNoPreference = Object.entries(preferences).filter(pref => pref[0] !== "No Preference");

    const notNoPreferenceCount = notNoPreference.reduce((acc,curr) => acc += curr[1], 0);

    const highestPref = notNoPreference[0][1] > notNoPreference[1][1] ? notNoPreference[0] : notNoPreference[1];

    preferencesSpan.innerText = `Of the people who detected a difference, ${(highestPref[1] / notNoPreferenceCount * 100).toFixed(0)}% preferred the "${highestPref[0]}" beer`;

    const preferencesCanvas = document.getElementById('preferences');
    if (!preferencesCanvas) return;

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

// reduce all the flaws from triangle tests into an object
function gatherFlaws(article) {
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

    return flaws;
}

// visualize off-flavours detected
function chartFlaws(article) {
    const flaws = gatherFlaws(article);
    
    const beer1 = Object.values(article.beer_key)[0];
    const beer2 = Object.values(article.beer_key)[1];

    const flawsCanvas = document.getElementById("flaws");
    if (!flawsCanvas) return;

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
}

// reduce triangle test comparison data for the 2 beers
function gatherComparisonData(article) {
    // collect the relative scores for each descriptor for each beer
    // 4 means way more of that descriptor for that beer.  
    // 0 means way more of that descriptor for THE OTHER beer.
    // baseline is 2.  2 === the beers are equal
    const comparisons = article.triangle_tests.reduce((acc, curr) => {
        // if (curr.preference === 'none') return acc;
        const { perceived_unique, perceived_other } = translateActualBeers(article, curr);
        const descriptors = ["balance", "bitterness", "malt_character", "yeast_character", "hop_character", "body", "carbonation"];
        
        acc[perceived_unique] = acc[perceived_unique] || {};
        acc[perceived_other] = acc[perceived_other] || {};

        // loop descriptors 
        descriptors.forEach(descriptor => {
            acc[perceived_unique][descriptor] = acc[perceived_unique][descriptor] || [];
            acc[perceived_other][descriptor] = acc[perceived_other][descriptor] || [];

            if (curr[descriptor] > 2) {
                acc[perceived_unique][descriptor].push(curr[descriptor]);
            }
            else if (curr[descriptor] < 2) {
                acc[perceived_other][descriptor].push(Math.abs(curr[descriptor]));
            }
            else if (curr[descriptor] === 2) {
                acc[perceived_unique][descriptor].push(curr[descriptor]);

                acc[perceived_other][descriptor].push(Math.abs(curr[descriptor]));
            }
        })
        return acc;
    },{})

    return comparisons;
}

async function displayResults() {
    const article = await getArticle();
    if (!article) {
        makeAlert("No article found!");
        return;
    }
    if (!article.triangle_tests.length) return;
    chartDemographics(article);
    chartPreferences(article);
    chartFlaws(article);
    gatherComparisonData(article);
}

window.onload = displayResults;