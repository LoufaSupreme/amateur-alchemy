const eyeIcons = document.querySelectorAll('.eye-icon');
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