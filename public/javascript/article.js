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
        const slug = urlComponents[urlComponents.length - 2];
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

// add demographics results top-matter
function demographicSpecs(triangleTests) {
    // set num-responses spans
    const numResponsesSpans = document.querySelectorAll('.num-responses');
    numResponsesSpans.forEach(span => span.innerText = triangleTests.length);

    // add icons for each demographic credential
    const icons = document.querySelector('.icons');

    const cicerones = triangleTests.filter(test => {
        return test.additional_training.includes('cicerone')
    });

    const bjcp = triangleTests.filter(test => {
        return test.additional_training.some(elem => elem.includes('bjcp'));
    }); 

    const sensory_training = triangleTests.filter(test => {
        return test.additional_training.includes('sensory')
    }); 

    if (cicerones.length) {
        createDemoIcon(icons, 'cicerone', cicerones.length);
    }

    if (bjcp.length) {
        createDemoIcon(icons, 'bjcp', bjcp.length);
    }

    if (sensory_training.length) {
        createDemoIcon(icons, 'sensory_training', sensory_training.length);
    }
}

// create demographic credential icon
function createDemoIcon(parent, type, num) {
    const descriptor = type === 'cicerone' ? 'Cicerones' : type === 'bjcp' ? 'BJCP Judges' : 'With Sensory Training';
    
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');
    
    const iconImg = document.createElement('img');
    iconImg.src = `/images/${type}_icon.png`;

    const iconText = document.createElement('span');
    iconText.classList.add('smaller-text');
    iconText.innerText = `${num} ${descriptor}`;

    iconContainer.appendChild(iconImg);
    iconContainer.appendChild(iconText);

    parent.appendChild(iconContainer);
}

// make demographics chart
function chartDemographics(article) {
    // find chart element
    const demographicsCanvas = document.getElementById("demographics");

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
    demographicSpecs(article.triangle_tests);

    // create the chart
    makeChart(demographicsCanvas, 'bar', demographicsChartData, demographicChartOptions);
}

async function displayResults() {
    const article = await getArticle();
    chartDemographics(article);
}

// const chartContainers = document.querySelectorAll('.chart');
// chartContainers.forEach(chartContainer => {
//     createChart(chartContainer, chartContainer.dataset.type)
// })