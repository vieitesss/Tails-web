// Variable global que representa el mapa
let myMap = undefined;
// Variable global que representa el proveedor de teselas
let tilesProvider = undefined;
// Variable global que representa el control de zoom
let zoomControl = undefined;
// Variable global que almacena los marcadores
const markers = [];

// Se añade un evento para cargar el mapa y los marcadores cuando la página
// esté completamente cargada
window.onload = function() {
  initMap();
  // Por defecto se muestran las protectoras y refugios
  showProtectorsRefugees();
}

// Inicialización del mapa
function initMap() {
  tilesProvider = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  myMap = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([42.88, -8.535], 12);

  L.tileLayer(tilesProvider, {
    maxZoom: 18,
  }).addTo(myMap);

  addZoomButtons();
}

// Añade los botones de zoom al mapa en la esquina inferior derecha en vez de
// la esquina superior izquierda por defecto
function addZoomButtons() {
  zoomControl = L.control.zoom({
    position: 'bottomright'
  }).addTo(myMap);
}

// ------ Funciones principales ------

// Cambian el tipo de lugares que se muestran en el mapa
// La secuencia que se sigue en las siguientes funciones es la misma:
// 1. Se eliminan los marcadores actuales
// 2. Se obtienen los datos correspondientes
// 3. Se añaden los marcadores al mapa
// 4. Se añaden los elementos a la lista correspondiente

// Muestra las protectoras y refugios
function showProtectorsRefugees() {
  deleteMarkers();

  getProtectorsRefugees().then(protectors => {
    protectors.forEach(protector => {
      addMarker(protector);
      addPRToHTML(protector);
    });
  }).catch(error => {
    console.log(error);
  });
}

function showShops() {
  deleteMarkers();
  shops = getShops().then(shops => {
    shops.forEach(shop => {
      addMarker(shop);
      addShopToHTML(shop);
    });
  }).catch(error => {
    console.log(error);
  });
}

function showVets() {
  deleteMarkers();
  vets = getVets().then(vets => {
    vets.forEach(vet => {
      addMarker(vet);
      addVetToHTML(vet);
    });
  }).catch(error => {
    console.log(error);
  });
}

// ----- Funciones de carga de datos -----

// Para cargar los datos de protectoras y refugios se utiliza un archivo XML,
// así se puede ver cómo se utiliza XMLHttpRequest
function getProtectorsRefugees() {
  return new Promise((resolve, reject) => {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          // Cuando está listo el archivo XML se procesa
          const data = processProtectorsRefugees(this);
          resolve(data);
        } else {
          reject('Error al cargar el archivo XML: ' + this.status);
        }
      }
    }

    // Ruta relativa con respecto al HTML que carga el script
    xhttp.open('GET', '../resources/data/protectoras_y_refugios.xml', true);
    xhttp.send();
  });
}

// Las dos siguientes funciones cargan los datos de tiendas y veterinarias
// de la misma manera.
// Para cargar los datos de tiendas y veterinarias se utiliza un archivo JSON
// En este caso utilizo jQuery para cargar el archivo
function getShops() {
  return new Promise((resolve, reject) => {
    $.getJSON('../resources/data/tiendas_y_veterinarias.json')
      .done(function(data) {
        const shops = processShops(data);
        resolve(shops);
      })
      .fail(function(jqxhr, textStatus, error) {
        reject('Error al cargar el archivo JSON: ' + textStatus + ', ' + error);
      });
  });
}

function getVets() {
  return new Promise((resolve, reject) => {
    $.getJSON('../resources/data/tiendas_y_veterinarias.json')
      .done(function(data) {
        const vets = processVets(data);
        resolve(vets);
      })
      .fail(function(jqxhr, textStatus, error) {
        reject('Error al cargar el archivo JSON: ' + textStatus + ', ' + error);
      });
  });
}

// Procesamiendo XML

function processProtectorsRefugees(xml) {
  const xmlDoc = xml.responseXML;
  const protectors = xmlDoc.getElementsByTagName('protectora');
  const refugees = xmlDoc.getElementsByTagName('refugio');
  const protectorsRefugees = [];

  for (var i = 0; i < protectors.length; i++) {
    protectorsRefugees.push(processXMLElement(protectors[i]));
  }

  for (var i = 0; i < refugees.length; i++) {
    protectorsRefugees.push(processXMLElement(refugees[i]));
  }

  return protectorsRefugees;
}

// Función auxiliar para procesar los elementos XML
function processXMLElement(element) {
  return {
    lat: element.getElementsByTagName('lat')[0].childNodes[0].nodeValue,
    lon: element.getElementsByTagName('lon')[0].childNodes[0].nodeValue,
    name: element.getElementsByTagName('nombre')[0].childNodes[0].nodeValue,
    dir: element.getElementsByTagName('direccion')[0].childNodes[0].nodeValue,
    city: element.getElementsByTagName('ciudad')[0].childNodes[0].nodeValue
  }
}

// Procesamiento JSON

function processShops(data) {
  const shops = [];
  data.tiendas.forEach(shop => {
    shops.push(processJSONElement(shop));
  });

  return shops;
}

function processVets(data) {
  const vets = [];
  data.veterinarias.forEach(vet => {
    vets.push(processJSONElement(vet));
  });

  return vets;
}

// Función auxiliar para procesar los elementos JSON
function processJSONElement(element) {
  return {
    lat: parseFloat(element.lat),
    lon: parseFloat(element.lon),
    name: element.nombre,
    dir: element.direccion,
    city: element.ciudad
  }
}

// Funciones de añadir marcadores y elementos a la lista

// Elimina todos los marcadores del mapa
function deleteMarkers() {
  markers.forEach(marker => {
    myMap.removeLayer(marker);
  });

  markers.length = 0;
}

// Añade un marcador al mapa
function addMarker(mark) {
  markers.push(new L.marker([mark.lat, mark.lon]).bindPopup('<b>' + mark.name + '</b><br>' + mark.dir + '<br>' + mark.city));
  myMap.addLayer(markers[markers.length - 1]);
}

// Las siguientes tres funciones añaden un elemento a la lista que corresponde
// a cada tipo de lugar (protectoras y refugios, tiendas y veterinarias)
function addPRToHTML(mark) {
  const uldiv = document.querySelector('#collapse-protectoras > div');
  if (uldiv.children.length >= markers.length) return;

  uldiv.appendChild(createListElement(mark));
}

function addShopToHTML(mark) {
  const uldiv = document.querySelector('#collapse-tiendas > div');
  if (uldiv.children.length >= markers.length) return;

  uldiv.appendChild(createListElement(mark));
}

function addVetToHTML(mark) {
  const uldiv = document.querySelector('#collapse-vet > div');
  if (uldiv.children.length >= markers.length) return;

  uldiv.appendChild(createListElement(mark));
}

// Función auxiliar para crear elementos de las listas de lugares que se
// muestran en el mapa
function createListElement(mark) {
  const h4 = document.createElement('h4');
  h4.appendChild(document.createTextNode(mark.name));

  const dir = document.createElement('p');
  dir.appendChild(document.createTextNode(mark.dir));

  const city = document.createElement('p');
  city.appendChild(document.createTextNode(mark.city));

  const li = document.createElement('li');
  li.appendChild(h4);
  li.appendChild(dir);
  li.appendChild(city);

  return li;
}

// Esta función se encarga de añadir o eliminar los botones de zoom en el mapa
// dependiendo de si la lista de navegación está abierta o no, por temas de 
// experiencia de usuario
function removeZoomButtons() {
  const nav = document.getElementById('my-nav-list');
  if (!nav) return;

  if (nav.classList.contains('open') && zoomControl) {
    myMap.removeControl(zoomControl);
    zoomControl = undefined;
  } else if(!zoomControl){
    addZoomButtons();
  }
}

document.addEventListener('click', removeZoomButtons);
