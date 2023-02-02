async function getArticle() {
  try {
    const slug = window.location.href.split('/').at(-2);
    const response = await fetch(`/api/get-article/${slug}`);
    const articleData = await response.json();
    
    console.log(articleData)

    // make correct chart
    const ctx = document.getElementById("correct").getContext('2d');
    const correctChartData = {
      labels: [
        'Correct',
        'Incorrect'
      ],
      datasets: [{
        label: 'Correct Guesses',
        data: [300, 50],
        backgroundColor: [
          'green',
          'red',
        ],
        hoverOffset: 50
      }]
    }
    makeChart(ctx, 'pie', correctChartData)

    // make demographics chart
  }
  catch(err) {
    console.error(err);
  }
}

getArticle()

function makeChart(ctx, type, data) {

  // make new chart
  const myChart = new Chart(ctx, {
    type: type,
    plugins: [ChartDeferred],
    data: data
  });
}