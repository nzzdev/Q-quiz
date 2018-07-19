import Leaflet from "leaflet";
import iconPinSvg from "./resources/icon-pin.svg!text";
import { getAnswerTextElement, getDistanceText } from "./answerHelpers.js";

Leaflet.Icon.Default.imagePath =
  "jspm_packages/github/Leaflet/Leaflet@1.3.3/dist/images";

const tileUrl =
  "https://api.mapbox.com/styles/v1/neuezuercherzeitung/cj3yj33bk1w5t2rmyy0jty3bb/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmV1ZXp1ZXJjaGVyemVpdHVuZyIsImEiOiJjaXFnbWpvbmMwMDk4aHptY2RiYjM0dHc2In0.Y3HeaE0zhj9OaFEoDIrxRA";

const mapOptions = {
  boxZoom: false,
  doubleClickZoom: false,
  dragging: false,
  scrollWheelZoom: false,
  keyboard: false,
  touchZoom: false,
  zoomControl: false,
  inertia: false,
  tap: false
};

function mapFitBbox(map, bbox) {
  if (!bbox) {
    return;
  }
  map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
}

export default class MapPointGuessHandler {
  constructor(questionElement, data, quizId, toolBaseUrl) {
    this.questionElement = questionElement;
    this.data = data;
    this.quizId = quizId;
    this.toolBaseUrl = toolBaseUrl;
  }

  renderInput() {
    this.inputElement = this.questionElement.querySelector(".q-quiz-input");
    let mapContainer = this.inputElement.querySelector(".q-quiz-map-container");
    let map = L.map(mapContainer, mapOptions);
    mapFitBbox(map, this.data.correctAnswer.bbox);

    this.setMapSize(map);
    window.addEventListener("resize", () => {
      try {
        this.mapBounds = map.getBounds();
        this.setMapSize(map);
      } catch (e) {}
    });

    map.attributionControl.setPrefix("");

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &amp; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      bounds: [[90, -180], [-90, 180]],
      noWrap: true
    }).addTo(map);

    this.mapBounds = map.getBounds();

    let markerPinIcon = Leaflet.divIcon({
      className: "q-quiz-map-pin",
      html: iconPinSvg,
      iconSize: 52,
      iconAnchor: [26, 38]
    });

    this.marker = new L.marker(
      {},
      {
        icon: markerPinIcon,
        draggable: "true"
      }
    );

    let answerButton = this.inputElement.querySelector(".q-quiz-answer-button");
    map.on("click", e => {
      this.marker.setLatLng(e.latlng);
      map.addLayer(this.marker);
      answerButton.removeAttribute("disabled");
    });
  }

  setMapSize(map) {
    let container = map.getContainer();
    container.style.height = `${map.getSize()["x"] * (9 / 16)}px`;
    map.invalidateSize();
  }

  getValue(event) {
    let correctLatLng = new L.latLng([
      this.data.correctAnswer.geometry.coordinates[1],
      this.data.correctAnswer.geometry.coordinates[0]
    ]);
    return {
      latLng: this.marker.getLatLng(),
      distance: Math.floor(this.marker.getLatLng().distanceTo(correctLatLng))
    };
  }

  renderResult(answer) {
    const correctAnswer = this.data.correctAnswer;
    this.resultElement = this.questionElement.querySelector(".q-quiz-result");
    let mapContainer = this.resultElement.querySelector(
      ".q-quiz-map-container"
    );

    let map = L.map(mapContainer, mapOptions);
    map.attributionControl.setPrefix("");

    mapFitBbox(map, correctAnswer.bbox);

    this.setMapSize(map);

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &amp; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    this.bounds = map.getBounds();

    if (answer && answer.latLng) {
      // add the correct point and the users input point
      let west = this.bounds.getWest();
      let east = this.bounds.getEast();

      let correctAnswerLabelPosition;
      let answerLabelPosition;
      if (correctAnswer.geometry.coordinates[1] > answer.latLng.lat) {
        correctAnswerLabelPosition = "top";
        answerLabelPosition = "bottom";
      } else {
        correctAnswerLabelPosition = "bottom";
        answerLabelPosition = "top";
      }
      if (correctAnswer.geometry.coordinates[0] < west + (east - west) / 2) {
        correctAnswerLabelPosition += "right";
      } else {
        correctAnswerLabelPosition += "left";
      }
      if (answer.latLng.lng < west + (east - west) / 2) {
        answerLabelPosition += "right";
      } else {
        answerLabelPosition += "left";
      }

      let correctAnswerLabel = "";
      if (
        correctAnswer.properties.pointLabel &&
        correctAnswer.properties.pointLabel.length &&
        correctAnswer.properties.pointLabel.length > 0
      ) {
        correctAnswerLabel = correctAnswer.properties.pointLabel;
      }
      let correctAnswerMarker = Leaflet.marker(
        [
          correctAnswer.geometry.coordinates[1],
          correctAnswer.geometry.coordinates[0]
        ],
        {
          icon: Leaflet.divIcon({
            className: "q-quiz-map-marker s-font-note-s s-color-grey-8",
            iconSize: [8, 8],
            html: `<div class="q-quiz-map-marker__label q-quiz-map-marker__label--${correctAnswerLabelPosition} s-font-note s-font-note--strong s-color-grey-8">${correctAnswerLabel}</div>`
          })
        }
      );

      let answerMarker = Leaflet.marker(
        [answer.latLng.lat, answer.latLng.lng],
        {
          icon: Leaflet.divIcon({
            className: "q-quiz-map-marker s-font-note-s s-color-primary-7",
            iconSize: [8, 8],
            html: `<div class="q-quiz-map-marker__label q-quiz-map-marker__label--${answerLabelPosition} s-font-note s-font-note--strong s-color-primary-7">Ihre Schätzung</div>`
          })
        }
      );

      map.addLayer(correctAnswerMarker);
      map.addLayer(answerMarker);
    }

    this.addHeatmapOverlayToMap(map);
  }

  renderResultStats(answer, answersStats) {
    let isCorrectAnswer = answer === this.data.correcAnswer;
    let resultTextElement = this.questionElement.querySelector(
      ".q-quiz-result .q-quiz-result-answer-text"
    );

    let textElement = getAnswerTextElement(
      answersStats,
      isCorrectAnswer,
      () => {
        let text = "";
        if (answer.distance !== undefined) {
          let distanceText = getDistanceText(answer.distance);
          text = ` Ihre Schätzung liegt um ${distanceText} daneben.`;
        }
        return text;
      }
    );

    resultTextElement.appendChild(textElement);
  }

  addHeatmapOverlayToMap(map) {
    let heatmapImg = document.createElement("img");
    heatmapImg.setAttribute(
      "style",
      "position: absolute; top: 0; z-index: 1000;"
    );

    let heatmapImgOverlay = L.imageOverlay("", map.getBounds(), {
      opacity: 0.4
    }).addTo(map);

    this.setHeatmapSrc(heatmapImgOverlay, map);

    map.on("resize", () => {
      this.setMapSize(map);
      heatmapImgOverlay.setUrl("");
      this.setHeatmapSrc(heatmapImgOverlay, map);
    });
  }

  setHeatmapSrc(heatmapImgOverlay, map) {
    let mapBounds = map.getBounds();
    let southWest = mapBounds.getSouthWest();
    let northEast = mapBounds.getNorthEast();
    let heatmapBounds = `${southWest.lng}, ${southWest.lat}, ${
      northEast.lng
    }, ${northEast.lat}`;
    heatmapImgOverlay.setUrl(
      `${this.toolBaseUrl}/map/${this.data.id}/heatmap/${map.getSize().x}/${
        map.getSize().y
      }/${heatmapBounds}`
    );
  }
}
