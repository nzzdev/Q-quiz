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

  constructor(questionContainer, data) {
    this.questionContainer = questionContainer;
    this.data = data;
  }

  renderInput() {
    this.inputElement = this.questionContainer.querySelector('.q-quiz-input');
    let mapContainer = this.inputElement.querySelector('.q-quiz-map-container');
    let map = L.map(mapContainer, mapOptions);
    mapFitBbox(map, this.data.bbox);

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

    let answerButton = this.inputElement.querySelector('.q-quiz-answer-button');
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

  getValue() {
    let correctLatLng = new L.latLng(this.data.correctAnswer.lat, this.data.correctAnswer.lng)
    return {
      latLng: this.marker.getLatLng(),
      distance: Math.floor(this.marker.getLatLng().distanceTo(correctLatLng))
    } 
  }

  renderResult() {
    // answer -- getValue
    this.resultElement = this.questionContainer.querySelector('.q-quiz-result');
    let mapContainer = this.resultElement.querySelector('.q-quiz-map-container');
    const answer = this.getValue();
    console.log('answer: ', answer);

    let map = L.map(mapContainer, mapOptions);
    map.attributionControl.setPrefix('');

    mapFitBbox(map, this.data.bbox);

    this.setMapSize(map);

    L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &amp; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    if (answer && answer.latLng) {
      // add the correct point and the users input point
      let bounds = map.getBounds();
      let west = bounds.getWest();
      let east = bounds.getEast();

      let correctAnswerLabelPosition;
      let answerLabelPosition;
      if (this.data.correctAnswer.lat > answer.latLng.lat) {
        correctAnswerLabelPosition = 'top';
        answerLabelPosition = 'bottom';
      } else {
        correctAnswerLabelPosition = 'bottom';
        answerLabelPosition = 'top';
      }
      if (this.data.correctAnswer.lng < west + ((east - west) / 2)) {
        correctAnswerLabelPosition += 'right';
      } else {
        correctAnswerLabelPosition += 'left';
      }
      if (answer.latLng.lng < west + ((east - west) / 2)) {
        answerLabelPosition += 'right';
      } else {
        answerLabelPosition += 'left';
      }

      let correctAnswerLabel = '';
      if (this.data.pointLabel && this.data.pointLabel.length && this.data.pointLabel.length > 0) {
        correctAnswerLabel = this.data.pointLabel;
      }
      let correctAnswerMarker = Leaflet
        .marker([this.data.correctAnswer.lat, this.data.correctAnswer.lng], {
          icon: Leaflet
            .divIcon({
              className: 'q-quiz-map-marker s-font-note-s s-color-grey-8',
              iconSize: [8,8],
              html: `<div class="q-quiz-map-marker__label q-quiz-map-marker__label--${correctAnswerLabelPosition} s-font-note s-font-note--strong s-color-grey-8">${correctAnswerLabel}</div>`
            })
        });

      let answerMarker = Leaflet
        .marker([answer.latLng.lat, answer.latLng.lng], {
          icon: Leaflet
            .divIcon({
              className: 'q-quiz-map-marker s-font-note-s s-color-primary-5',
              iconSize: [8,8],
              html: `<div class="q-quiz-map-marker__label q-quiz-map-marker__label--${answerLabelPosition} s-font-note s-font-note--strong s-color-primary-5">Ihre Schätzung</div>`
            })
        });

      map.addLayer(correctAnswerMarker);
      map.addLayer(answerMarker);
    }

    //this.addHeatmapOverlayToMap(map)
  }

}
