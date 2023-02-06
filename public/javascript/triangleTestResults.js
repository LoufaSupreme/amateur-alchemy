async function getArticle() {
  try {
    const slug = window.location.href.split('/').at(-2);
    const response = await fetch(`/api/get-article/${slug}`);
    const articleData = await response.json();
    console.log(articleData);

    const numCorrectResponses = articleData.triangle_tests.filter(test => {
      return test.perceived_unique === test.actual_unique.cup;
    });

    console.log(correct);

    // make correct chart
    let canvas = document.getElementById("correct")
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
    makeChart(canvas, 'pie', correctChartData)

    // make demographics chart
  }
  catch(err) {
    console.error(err);
  }
}

// https://stackoverflow.com/questions/7743007/most-efficient-way-to-write-combination-and-permutation-calculator-in-javascript
function factorial(n) { 
  let x=1; 
  let f=1;
  while (x <= n) {
    f *= x; 
    x++;
  }
    return f;
}

// nCr or "n Choose r"
// combinations of total trials (n) and correct trials (r)
function calcCombinations(n, r) {
  return factorial(n) / (factorial(n - r) * factorial(r))
}

// calculate the probability of getting exactly num_correct correct responses
function calcBinomialProbability(num_trials, num_correct, prob_success, prob_fail) {
  return calcCombinations(num_trials, num_correct) * Math.pow(prob_success, num_correct) * Math.pow(prob_fail, num_trials-num_correct);
}

// return an array of the binomial probability of every  
// amount of correct answers from 0 to num_trials
function calcBinomialDistribution(num_trials, prob_success, prob_fail) {
  const distribution = [];
  for (let i = 0; i < num_trials; i++) {
    const prob = calcBinomialProbability(num_trials, i, prob_success, prob_fail);
    distribution.push(prob);
  }
  return distribution;
}

// the p-value is the sum of the binomial distribution from 0 to num_correct - 1
// this assumes a right-tailed binomial distribution test
// a p-value of 0.05 or smaller indicates statistical significance
function calcP_val(binomialDistribution, num_correct) {
  return 1 - binomialDistribution.reduce((acc, curr, idx) => {
    if (idx < num_correct) acc += curr;
    return acc;
  })
}

// calculate the minimum num of correct responses needed for this
// test to be statistically significant at target_p value
function calcCriticalCorrect(binomialDistribution, target_p) {
  let p = 1; 
  let num_correct = 0; 
  while (p > target_p) {
    p -= binomialDistribution[num_correct];
    num_correct++;
  }
  return {p, num_correct};
}

function makeChart(canvas, type, data) {
  
  const ctx = canvas.getContext('2d');
  
  // make new chart
  const myChart = new Chart(ctx, {
    type: type,
    plugins: [ChartDeferred],
    data: data
  });
}

getArticle()