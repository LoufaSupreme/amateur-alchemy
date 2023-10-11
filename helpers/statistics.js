// STATISTICS MATH

// https://stackoverflow.com/questions/7743007/most-efficient-way-to-write-combination-and-permutation-calculator-in-javascript
factorial = (n) => { 
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
calcCombinations = (n, r) => {
  return factorial(n) / (factorial(n - r) * factorial(r))
}

// calculate the probability of getting exactly num_correct correct responses
calcBinomialProbability = (num_trials, num_correct, prob_success, prob_fail) => {
  return calcCombinations(num_trials, num_correct) * Math.pow(prob_success, num_correct) * Math.pow(prob_fail, num_trials-num_correct);
}

// return an array of the binomial probability of every  
// amount of correct answers from 0 to num_trials
exports.calcBinomialDistribution = (num_trials, prob_success, prob_fail) => {
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
exports.calcP_val = (binomialDistribution, num_correct) => {
  if (binomialDistribution.length <= 0) return 0;
  return 1 - binomialDistribution.reduce((acc, curr, idx) => {
    if (idx < num_correct) acc += curr;
    return acc;
  })
}

// calculate the minimum num of correct responses needed for this
// test to be statistically significant at target_p value
exports.calcCriticalCorrect = (binomialDistribution, target_p) => {
  let p_val = 1; 
  let num_correct = 0; 
  while (p_val > target_p) {
    p_val -= binomialDistribution[num_correct];
    num_correct++;
  }
  return {p_val, num_correct};
}