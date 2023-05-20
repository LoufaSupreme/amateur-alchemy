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

const chartContainers = document.querySelectorAll('.chart');
chartContainers.forEach(chartContainer => {
    console.log(chartContainer)
    createChart(chartContainer, chartContainer.dataset.type)
})
