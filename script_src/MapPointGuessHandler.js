import Leaflet from 'leaflet';
import iconPinSvg from './resources/icon-pin.svg!text'

Leaflet.Icon.Default.imagePath = 'jspm_packages/npm/leaflet@1.0.0-rc.1/dist/images'

const tileUrl = 'https://api.mapbox.com/styles/v1/neuezuercherzeitung/ciqkqfx6g002rc5m9obtblxlk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmV1ZXp1ZXJjaGVyemVpdHVuZyIsImEiOiJjaXFnbWpvbmMwMDk4aHptY2RiYjM0dHc2In0.Y3HeaE0zhj9OaFEoDIrxRA'

const mapOptions = {
  boxZoom: false,
  doubleClickZoom: false,
  dragging: false,
  scrollWheelZoom: false,
  keyboard: false,
  touchZoom: false,
  zoomControl: false,
  inertia: false,
  tap: false,
}

function mapFitBbox(map, bbox) {
  if (!bbox) {
    return;
  }
  let bboxParts = bbox.split(',')
  map.fitBounds([
    [bboxParts[1], bboxParts[0]],
    [bboxParts[3], bboxParts[2]]
  ]);
}

export default class MapPointGuessHandler {

  constructor(mapContainer, quizElementData) {
    this.mapContainer = mapContainer;
    this.quizElementData = quizElementData;
  }

  renderInput(element) {
    let map = L.map(element, mapOptions);
    console.log(this.quizElementData);
    console.log(this.quizElementData.bbox);
    mapFitBbox(map, this.quizElementData.bbox);

    this.setMapSize(map);
    window.addEventListener('resize', () => {
      try {
        this.setMapSize(map)
      } catch (e) {

      }
    })

    map.attributionControl.setPrefix('')

    L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &amp; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

    let markerPinIcon = Leaflet.divIcon({
      className: 'q-quiz-map-pin',
      html: iconPinSvg,
      iconSize: 52,
      iconAnchor: [26,38]
    })

    this.marker = new L.marker({}, { 
      icon: markerPinIcon,
      draggable: 'true'
    });

    let answerButton = this.mapContainer.querySelector('.q-quiz-answer-button');
    map.on('click', (e) => {
      this.marker.setLatLng(e.latlng)
      map.addLayer(this.marker)
      answerButton.removeAttribute('disabled')
    });
  }

  setMapSize(map) {
    let container = map.getContainer();
    container.style.height = map.getSize()['x'] * (9/16) + 'px';
    map.invalidateSize();
  }

}
