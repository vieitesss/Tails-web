// Incluye el contenido de los archivos `header.html` y `footer.html` en las
// etiquetas correspondientes
$(document).ready(function(){
  $.ajaxSetup ({
    cache: false
  });

  $(".my-nav").load("../../html/header.html");
  $("footer").load("../../html/footer.html");
});

// Esta función se encarga de añadir o eliminar la clase `open` al elemento
// que se corresponde con la lista de navegación en dispositivos móviles
function toggleList(e) {
  const navList = document.getElementById('my-nav-list');
  if (!navList) return;

  if (!e || (e.target === navList && navList.classList.contains('open'))) {
    navList.classList.toggle('open');
  }
}
