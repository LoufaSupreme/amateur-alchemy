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
const chartContainers = document.querySelectorAll('.chart');
chartContainers.forEach(chartContainer => {
    console.log(chartContainer)
    createChart(chartContainer, chartContainer.dataset.type)
})



// async function getBeerJSON(slug) {
//     try {
//         const response = await fetch(`/api/get-beer/${slug}`);
//         const beerData = await response.json();
//         const beerAttributes = Object.keys(beerData.beer.attributes).map(attr => {
//             return capitalizeFirst(attr).replace('_', ' ');
//         });
    
        
//         // make new chart
//         const myChart = new Chart(ctx, {
//             type: 'radar',
//             plugins: [ChartDeferred],
//             data: {
//                 labels: beerAttributes,
//                 datasets: [{
//                     label: `${beerData.beer.name}`,
//                     data: Object.values(beerData.beer.attributes),
//                     // order: 1, // higher # = drawn first
//                     backgroundColor: [
//                         'rgba(255, 99, 132, 0.2)',
//                         // 'rgba(54, 162, 235, 0.2)',
//                         // 'rgba(255, 206, 86, 0.2)',
//                         // 'rgba(75, 192, 192, 0.2)',
//                         // 'rgba(153, 102, 255, 0.2)',
//                         // 'rgba(255, 159, 64, 0.2)'
//                     ],
//                     borderColor: [
//                         'rgba(255, 99, 132, 1)',
//                         // 'rgba(54, 162, 235, 1)',
//                         // 'rgba(255, 206, 86, 1)',
//                         // 'rgba(75, 192, 192, 1)',
//                         // 'rgba(153, 102, 255, 1)',
//                         // 'rgba(255, 159, 64, 1)'
//                     ],
//                     fill: true,
//                     borderWidth: 1,
//                     hoverBorderColor: 'rgba(255, 99, 132, 1)',
//                     // hoverBackgroundColor: 'rgba(153, 102, 255, 0.5)',
//                     pointHoverRadius: 8,
//                 }]
//             },
//             options: {
//                 elements: {
//                     point: {
//                         radius: 3,
//                         pointStyle: 'circle'
//                     },
//                     line: {
//                         borderWidth: 2,
//                         spanGaps: false
//                     }
//                 },
//                 plugins: {
//                     legend: {
//                         display: true,
//                         position: 'top',
//                         align: 'center',
//                         title: {
//                             color: transparentWhite,
//                             display: true
//                         },
//                     },
//                     deferred: {
//                         xOffset: 150,  // defer until 150px of the canvas width are inside the viewport
//                         yOffset: '50%',  // defer until 50% of the canvas height are inside the viewport
//                         delay: 250  // delay of 500 ms after the canvas is considered inside the viewport
//                     },
//                     tooltip: {
//                         callbacks: {
//                             title: function(context) {
//                                 let title = context.map(ctx => ctx.label);
//                                 title = title.join(', ');
//                                 return title;
//                             },
//                             label: function(context) {
//                                 // title part of the tooltip
//                                 // let label = context.dataset.label || '';
                                
//                                 // if (label) {
//                                 //     label += ': ';
//                                 // }

//                                 let label = ""

//                                 const map = {
//                                     1: 'Extremely Low',
//                                     2: 'Low',
//                                     3: 'Moderate',
//                                     4: 'High',
//                                     5: 'Very high',
//                                     6: 'Insane'
//                                 }
//                                 // content part of the tooltip
//                                 // value at the "r" axis
//                                 if (context.parsed.r !== null) {
//                                     // label += context.label
//                                     label += `${map[context.parsed.r]}`;
//                                     // label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
//                                 }
//                                 return label;
//                             }
//                         }
//                     }
//                 },
//                 scales: {
//                     r: {
//                         angleLines: {
//                             color: transparentWhite
//                         },
//                         grid: {
//                             color: transparentWhite
//                         },
//                         pointLabels: {
//                             color: 'rgb(255 255 255 / 0.6)',
//                             font: {
//                                 size: 12
//                             }
//                         },
//                         ticks : {
//                             backdropColor: opaqueWhite,
//                             display: true,
//                             color: 'black',
//                             showLabelBackdrop: true,
//                             z: 0,
//                             callback: function(value, index, ticks) {
//                                 const map = {
//                                     1: 'Extremely Low',
//                                     2: 'Low',
//                                     3: 'Moderate',
//                                     4: 'High',
//                                     5: 'Very high',
//                                     6: 'Insane'
//                                 }
//                                 return map[value]
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }
//     catch(err) {
//         console.error(err)
//     }
// }