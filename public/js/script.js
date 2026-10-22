(() => {
  'use strict'
  const forms = document.querySelectorAll('form[data-bs-validate], form.needs-validation')

  for (const form of forms) {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')

      // Apply validation state classes directly to each input
      for (const control of form.elements) {
        if (control.willValidate) {
          if (control.checkValidity()) {
            control.classList.add('is-valid')
            control.classList.remove('is-invalid')
          } else {
            control.classList.add('is-invalid')
            control.classList.remove('is-valid')
          }
          control.setAttribute('aria-invalid', String(!control.validity.valid))
        }
      }
    }, false)

    // Update dynamically as the user types/corrects fields
    form.addEventListener('input', event => {
      const control = event.target
      if (control.willValidate) {
        if (control.checkValidity()) {
          control.classList.add('is-valid')
          control.classList.remove('is-invalid')
        } else {
          control.classList.add('is-invalid')
          control.classList.remove('is-valid')
        }
        control.setAttribute('aria-invalid', String(!control.validity.valid))
      }
    })
  }
})()