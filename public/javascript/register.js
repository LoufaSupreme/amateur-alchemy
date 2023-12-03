
// inputs
const passwordInput = document.querySelector('input[name="password"]');
const passwordConfirmInput = document.querySelector('input[name="password-confirm"]');
const nameInput = document.querySelector('input[name="name"]');
const passwordValidatorContainer = document.querySelector('.password-validation');
const passwordConfirmValidatorContainer = document.querySelector('.password-confirm-validation');

// validation statements
const validators = document.querySelectorAll('.validator');

// form elements
const form = document.querySelector('form');
const registerBtn = document.querySelector('#register-btn');
const eyeIcons = document.querySelectorAll('.eye-icon');

/////////// Validation Functions

function isValidPassword(pwd) {
  // reset all validator stmts
  resetValidators();

  let errors = [];
  
  // check for length
  if (pwd.length >= 6) {
    confirmValidator(findValidator(validators,'length'));
  }
  else {
    errors.push("Password must be at least 6 characters long");
  }

  // check for uppercase letter
  if(/[A-Z]/.test(pwd)) {
    confirmValidator(findValidator(validators, 'upper'));
  }
  else {
    errors.push("Password must contain an uppercase letter");
  }

  // check for lowercase letter
  if(/[a-z]/.test(pwd)) {
    confirmValidator(findValidator(validators, 'lower'));
  }
  else {
    errors.push("Password must contain a lowercase letter");
  }

  // check for number
  if(/[0-9]/.test(pwd)) {
    confirmValidator(findValidator(validators, 'num'));
  }
  else {
    errors.push("Password must contain a number");
  }

  // if there were errors:
  if (errors.length) {
    return errors;
  }
  // otherwise:
  return true;
}

function isValidPasswordConfirm(pwd) {
  resetValidators([findValidator(validators, "match")]);
  if (pwd === passwordInput.value && pwd !== "") {
    confirmValidator(findValidator(validators,'match'));
    return true;
  }
  return false;
}

function isValidName(name) {
  if (name.length < 2 || name.length > 35) {
    makeAlert("Name must be between 2 and 35 characters", 3000);
    return false;
  }
  return true;
}

function isNotBlankForm(form) {
  for (let input of Array.from(form.querySelectorAll('input'))) {
    if (input.value.trim() === "") {
      makeAlert("All fields must be filled in");
      return false;
    }
  }
  return true;
}

function resetValidators(vals = validators) {
  vals.forEach(val => {
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

//////////////// EVENT LISTENERS 

passwordInput.addEventListener('input', (e) => {
  isValidPassword(e.target.value.trim());
  isValidPasswordConfirm(passwordConfirmInput.value.trim());
})

// show the password checks
passwordInput.addEventListener('focus', () => {
  passwordValidatorContainer.classList.add("active");
})

passwordConfirmInput.addEventListener('input', (e) => {
  isValidPasswordConfirm(e.target.value.trim());
})

// show the password confirm checks
passwordConfirmInput.addEventListener('focus', () => {
  passwordConfirmValidatorContainer.classList.add("active");
})

// toggle password show
eyeIcons.forEach(eye => eye.addEventListener('click', () => {
  const parentInputField = eye.parentElement.querySelector('input');
  
  if (eye.dataset.active === "false") {
    eye.classList.add("fa-eye-slash");
    eye.classList.remove("fa-eye");
    parentInputField.type = 'text';
    eye.dataset.active = "true"
  }
  else {
    eye.classList.remove("fa-eye-slash");
    eye.classList.add("fa-eye");
    parentInputField.type = 'password';
    eye.dataset.active = "false"
  }
}))

// client side validate form before submitting
// registerBtn.addEventListener('click', (e) => {
//   if (!isNotBlankForm(form)) return e.preventDefault();
//   if (!isValidName(nameInput.value.trim())) return e.preventDefault();
//   if (isValidPassword(passwordInput.value.trim()) !== true) {
//     const errors = isValidPassword(passwordInput.value.trim());
//     errors.map(err => makeAlert(err, 3000));
//     return e.preventDefault();
//   }
//   if (!isValidPasswordConfirm(passwordConfirmInput.value.trim())) {
//     makeAlert("Passwords must match", 3000);
//     return e.preventDefault();
//   }
// })