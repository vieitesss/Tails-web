window.onload = function() {
  // Son los únicos elementos `<span>` en el documento, por lo que puedo usar
  // `getElementsByTagName`
  const radioAppearances = Array.from(document.getElementsByTagName('span'));

  // Añade un evento de click a cada uno de los botones de radio
  radioAppearances.forEach(span => {
    span.addEventListener('click', function() {
      // Selecciona el input que está justo antes del span, que se corresponde
      // con el propio botón de radio, y hace click en él
      const inputElem = this.previousElementSibling;
      inputElem.click();

      // Obtiene el valor del atributo `data-target` del botón de radio
      // clicado y lo usa para seleccionar el elemento correspondiente
      const target = inputElem.getAttribute('data-target');
      const listItem = document.querySelector(target);

      // Si el elemento existe, se realizan los cálculos necesarios para
      // centrar el elemento en la pantalla
      if (listItem) {
        scrollToCenter(listItem);
      }
    });
  });
}

const container = document.getElementById('dc-list');

// Variable para almacenar la última posición conocida del scroll
let lastKnownScrollPosition = 0;
// Flag para no sobrecargar la función `checkCenteredImage` con llamadas
// innecesarias
let ticking = false;

// Evento de scroll en el contenedor de imágenes para detectar cuándo un
// elemento está centrado en la pantalla
container.addEventListener('scroll', function(e) {
  // Actualiza la última posición conocida del scroll
  lastKnownScrollPosition = e.target.scrollLeft;
  if (!ticking) {
    window.requestAnimationFrame(function() {
      checkCenteredImage(lastKnownScrollPosition);
      ticking = false;
    });
    ticking = true;
  }
})

// Esta función se encarga de realizar los cálculos necesarios para saber si
// un elemento está centrado en la pantalla o no
function checkCenteredImage(scrollPos) {
  const items = container.getElementsByClassName('dc-item');

  // Calcula el centro del viewport ajustado a la posición del scroll
  const containerCenter = window.innerWidth / 2 + scrollPos;

  Array.from(items).forEach(img => {
    // Calcula el centro de la imagen actual
    const imgCenter = img.offsetLeft + img.offsetWidth / 2;

    // Verifica si el elemento está lo suficientemente cerca del centro del
    // viewport. Se compara la distancia al centro con la mitad del ancho de la
    // imagen.
    if (Math.abs(imgCenter - containerCenter) < img.offsetWidth / 2) {
      // Si el elemento está centrado, se añade la clase `centered` y se llama
      // a la función `changeCheckedRadio` para marcar el botón de radio
      // correspondiente
      if (!img.classList.contains('centered')) {
        img.classList.add('centered');
        changeCheckedRadio();
      }
    } else {
      img.classList.remove('centered');
    }
  });
}

// Esta función selecciona el botón de radio correspondiente al elemento
// centrado en la pantalla
function changeCheckedRadio() {
  // Obtiene el elemento centrado
  const checkedImg = document.querySelector('.centered');
  if (!checkedImg) return;

  // Obtiene el `id` del elemento centrado
  const id = checkedImg.closest('li')?.getAttribute('id');
  if (!id) return;

  // Busca el botón de radio correspondiente al elemento centrado y lo marca
  // como seleccionado
  document.querySelectorAll('.selectors li input').forEach(input => {
    if (input.dataset.target === `#${id}`) {
      input.click();
    }
  });
}

// Esta función de mostrar u ocultar el contenido de los elementos de la lista
// del carrusel
function collapse(event) {
  // Obtiene el elemento clicado
  const target = event.target.closest('li');
  if (!target) return;

  if (target.classList.contains('centered')) {
    // Si el elemento clicado está centrado, se añade o elimina la clase
    // `clicked` para mostrar u ocultar el contenido del elemento
    target.classList.toggle('clicked');

    // Se elimina el texto `click-me!` la primera vez que se hace click en un
    // elemento
    document.querySelectorAll('.dc-item > p').forEach(item => {
      item.remove();
    });
  } else {
    // Si el elemento clicado no está centrado, se centra haciendo click en el
    // botón de radio correspondiente
    const id = target.getAttribute('id');
    const radio = document.querySelector(`input[data-target="#${id}"]`);
    radio.click();
    scrollToCenter(target);
  }
}

// Esta función se encarga de centrar un elemento en la pantalla
function scrollToCenter(item) {
  const elementHalf = item.offsetLeft + item.offsetWidth / 2;
  const windowHalf = window.innerWidth / 2;
  const scrollX = elementHalf - windowHalf;
  container.scrollLeft = scrollX;
}
