const passwordInput = document.querySelector('input[name="password"]');
const passwordConfirmInput = document.querySelector('input[name="password-confirm"]');
const validators = document.querySelectorAll('.validator');

function validatePassword(pwd) {
  // reset all validator stmts
  resetValidators();
  
  // check for length
  if (pwd.length >= 6) confirmValidator(findValidator(validators,'length'))

  // check for uppercase letter
  if(/[A-Z]/.test(pwd)) confirmValidator(findValidator(validators, 'upper'));

  // check for lowercase letter
  if(/[a-z]/.test(pwd)) confirmValidator(findValidator(validators, 'lower'));

  // check for number
  if(/[0-9]/.test(pwd)) confirmValidator(findValidator(validators, 'num'));
}

function validatePasswordConfirm(pwd) {
  if (pwd === passwordInput.value && pwd !== "") confirmValidator(findValidator(validators,'match'))
}

function resetValidators() {
  validators.forEach(val => {
    val.parentElement.classList.remove('satisfied');
    val.parentElement.querySelector('.validator-icon').innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  });
}

function confirmValidator(validator) {
  validator.parentElement.classList.add('satisfied');
  validator.parentElement.querySelector('.validator-icon').innerHTML = '<i class="fa-regular fa-circle-check"></i>';
}

function findValidator(validators, target) {
  validators = Array.from(validators);
  return validators.find(val => val.dataset.type === target);
}

passwordInput.addEventListener('input', (e) => {
  validatePassword(e.target.value.trim());
})

passwordConfirmInput.addEventListener('input', (e) => {
  validatePasswordConfirm(e.target.value.trim());
})