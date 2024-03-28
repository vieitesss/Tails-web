document.getElementById('contact-form').addEventListener('submit', function(e) {
  // Previene el comportamiento predeterminado del formulario (envío)
  e.preventDefault();

  // Captura los valores del formulario
  const email = this.elements['email'].value;
  const message = this.elements['message'].value;
  const name = this.elements['name'].value;
  const subject = this.elements['subject'].value;

  // Muestra una alerta con la información
  alert("Email: " + email + "\nName: " + name + "\nSubject: " + subject + "\nMessage: " + message);

  // Restablece el formulario
  this.reset();
});

