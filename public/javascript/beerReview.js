
// draw score bar: 
const se = document.querySelector('.segment-se'); 
const sw = document.querySelector('.segment-sw');
const ne = document.querySelector('.segment-ne');
const nw = document.querySelector('.segment-nw');

const score = document.querySelector('.score');

// all segments start at skew(90) which is not visible
const targetScore = +score.dataset.score;
let currentScore = parseFloat(score.innerText.slice(0, -1));

function setGauge(score) {
    if (score >= 75) {
        se.style.setProperty('--skew', '0deg');
        sw.style.setProperty('--skew', '0deg');
        nw.style.setProperty('--skew', '0deg');
        ne.style.setProperty('--skew', `${90-((score-75)/25*90)}deg`);
    }
    else if (score >= 50) {
        se.style.setProperty('--skew', '0deg');
        sw.style.setProperty('--skew', '0deg');
        nw.style.setProperty('--skew', `${90-((score-50)/25*90)}deg`);
    }
    else if (score >= 25) {
        se.style.setProperty('--skew', '0deg');
        sw.style.setProperty('--skew', `${90-((score-25)/25*90)}deg`);
    }
    else {
        se.style.setProperty('--skew', `${90-((score)/25*90)}deg`);
    }
}

// linearly maps value from the range (a..b) to (c..d)
function mapRange (value, a, b, c, d) {
    // first map value from (a..b) to (0..1)
    value = (value - a) / (b - a);
    // then map it from (0..1) to (c..d) and return it
    return c + value * (d - c);
}

function updateScore(speed) {
    if (currentScore < targetScore) {
        score.innerText = `${currentScore+1}%`;
        currentScore = parseFloat(score.innerText.slice(0, -1));
        setGauge(currentScore);

        delay = mapRange(currentScore, 0, targetScore, 0, speed);
        
        //- const newDelay = delay;
        setTimeout(() => {
            updateScore(speed);
        }, delay);
    }
}

updateScore(50);

// image gallery
const gallery = document.querySelector('.img-gallery');
const galleryImgs = gallery.querySelectorAll('img');
const showcaseImg = document.querySelector('.showcase-img');

function handleImgClick(e) {
    galleryImgs.forEach(img => img.classList.remove('active'));
    e.target.classList.add('active');
    showcaseImg.src = e.target.src;
}

galleryImgs.forEach(img => img.addEventListener('click', handleImgClick));

// radar chart setup

const slug = window.location.href.split('/').at(-1);
const ctx = document.getElementById('radar').getContext('2d');

const transparentWhite = 'rgb(255 255 255 / 0.2)';
const opaqueWhite = 'rgb(255 255 255 / 0.6)';

async function getBeerJSON(slug) {
    try {
        const response = await fetch(`/api/get-beer/${slug}`);
        const beerData = await response.json();
        const beerAttributes = Object.keys(beerData.beer.attributes).map(attr => {
            return capitalizeFirst(attr).replace('_', ' ');
        });
    
        // set default chart size for chart.js
        Chart.defaults.font.size = 14;

        // make new chart
        const myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: beerAttributes,
                datasets: [{
                    label: `${beerData.beer.name}`,
                    data: Object.values(beerData.beer.attributes),
                    // order: 1, // higher # = drawn first
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        // 'rgba(54, 162, 235, 0.2)',
                        // 'rgba(255, 206, 86, 0.2)',
                        // 'rgba(75, 192, 192, 0.2)',
                        // 'rgba(153, 102, 255, 0.2)',
                        // 'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        // 'rgba(54, 162, 235, 1)',
                        // 'rgba(255, 206, 86, 1)',
                        // 'rgba(75, 192, 192, 1)',
                        // 'rgba(153, 102, 255, 1)',
                        // 'rgba(255, 159, 64, 1)'
                    ],
                    fill: true,
                    borderWidth: 1,
                    hoverBorderColor: 'rgba(153, 102, 255, 1)',
                    hoverBackgroundColor: 'rgba(153, 102, 255, 0.5)',
                    pointHoverRadius: 8,
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 3,
                        pointStyle: 'circle'
                    },
                    line: {
                        borderWidth: 2,
                        spanGaps: false
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'center',
                        title: {
                            color: transparentWhite,
                            display: true
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                // title part of the tooltip
                                // let label = context.dataset.label || '';
                                
                                // if (label) {
                                //     label += ': ';
                                // }

                                let label = ""

                                const map = {
                                    0: 'Extremely Low',
                                    1: 'Low',
                                    2: 'Moderate',
                                    3: 'High',
                                    4: 'Very high',
                                    5: 'Insane'
                                }
                                // content part of the tooltip
                                // value at the "r" axis
                                if (context.parsed.r !== null) {

                                    label += `${map[context.parsed.r]}`;
                                    // label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: transparentWhite
                        },
                        grid: {
                            color: transparentWhite
                        },
                        pointLabels: {
                            color: 'rgb(255 255 255 / 0.6)',
                            font: {
                                size: 12
                            }
                        },
                        ticks : {
                            backdropColor: opaqueWhite,
                            display: true,
                            color: 'black',
                            showLabelBackdrop: true,
                            z: 0,
                            callback: function(value, index, ticks) {
                                const map = {
                                    0: 'Extremely Low',
                                    1: 'Low',
                                    2: 'Moderate',
                                    3: 'High',
                                    4: 'Very high',
                                    5: 'Insane'
                                }
                                return map[value]
                            }
                        }
                    }
                }
            }
        });
    }
    catch(err) {
        console.error(err)
    }
}

getBeerJSON(slug);