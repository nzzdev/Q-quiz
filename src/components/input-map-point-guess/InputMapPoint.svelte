<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import L, { Marker, type LatLng, type Map } from 'leaflet';

  import type {
    MapPointGuess,
    MapPointGuessAnswer,
    QuizStoreContext,
  } from '@src/interfaces';
  import { EventTrackingService } from '@src/services/event-tracking';
  import key from '@src/services/key-service';

  import iconPinSvg from '@src/resources/icon-pin.svg';

  import Statistic from './Statistic.svelte';
  import BaseElement from '../quiz-base-elelement/BaseElement.svelte';
  import Button from '../atomic/Button.svelte';

  export let element: MapPointGuess;

  const { quizStore, logMSGStore } = getContext(key) as QuizStoreContext;
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
  };
  const correctLatLng = new L.LatLng(
    element.answer.geometry.coordinates[1],
    element.answer.geometry.coordinates[0]
  );

  let mapContainer: HTMLElement;
  let buttonDisabled = true;
  let map: Map;
  let mapBounds: L.LatLngBounds;
  let marker: Marker<any> | null = null;
  let userAnswerLayer: L.Layer | null = null;
  let isAnswered = false;

  $: mapConfiguration = $quizStore.configuration.mapConfiguration;

  onMount(() => {
    initialQuestion();
  });

  function initialQuestion() {
    map = L.map(mapContainer, mapOptions);

    mapFitBbox(map, element.answer.bbox);
    setMapSize(map);
    map.attributionControl.setPrefix('');

    userAnswerLayer = L.tileLayer(mapConfiguration.styleUrl, {
      maxZoom: 18,
      attribution: mapConfiguration.attribution,
      bounds: [
        [90, -180],
        [-90, 180],
      ],
      noWrap: true,
    }).addTo(map);

    mapBounds = map.getBounds();

    let markerPinIcon = L.divIcon({
      className: 'q-quiz-map-pin',
      html: iconPinSvg,
      iconSize: [52, 52],
      iconAnchor: [26, 38],
    });

    map.on('click', (event: L.LeafletMouseEvent) =>
      eventSetMarker(markerPinIcon, event)
    );
    isAnswered = quizStore.isAnswered();
  }

  async function getResult(event: CustomEvent) {
    logMSGStore.set('InputMapPoint getResult');
    try {
      const correctAnswer = element.answer;

      if (marker) {
        map.removeLayer(marker);
        // if (answer && answer.latLng) {
        // add the correct point and the users input point
        let west = mapBounds.getWest();
        let east = mapBounds.getEast();
        let correctAnswerLabel = '';

        const userAnswerLatLng = marker.getLatLng();
        const labelPositions = getLabelPositionAnswers(
          correctAnswer,
          userAnswerLatLng,
          east,
          west
        );

        if (
          correctAnswer.properties.pointLabel &&
          correctAnswer.properties.pointLabel.length &&
          correctAnswer.properties.pointLabel.length > 0
        ) {
          correctAnswerLabel = correctAnswer.properties.pointLabel;
        }
        let correctAnswerMarker = L.marker(
          [
            correctAnswer.geometry.coordinates[1],
            correctAnswer.geometry.coordinates[0],
          ],
          {
            icon: L.divIcon({
              className: 'q-quiz-map-marker s-font-note-s s-color-grey-8',
              iconSize: [8, 8],
              html: `<div class="q-quiz-map-marker__label q-quiz-map-marker__label--${labelPositions.correctAnswer} s-font-note s-font-note--strong s-color-grey-8">${correctAnswerLabel}</div>`,
            }),
          }
        );

        let answerMarker = L.marker(
          [userAnswerLatLng.lat, userAnswerLatLng.lng],
          {
            icon: L.divIcon({
              className: 'q-quiz-map-marker s-font-note-s s-color-primary-7',
              iconSize: [8, 8],
              html: `<div class="q-quiz-map-marker__label q-quiz-map-marker__label--${labelPositions.userAnswer} s-font-note s-font-note--strong s-color-primary-7">Ihre Schätzung</div>`,
            }),
          }
        );

        map.addLayer(correctAnswerMarker);
        map.addLayer(answerMarker);
        // }

        // addHeatmapOverlayToMap(map);
        quizStore
          .answerdQuestion($quizStore.qItemId, element, {
            latLng: { lat: userAnswerLatLng.lat, lng: userAnswerLatLng.lng },
            distance: correctLatLng.distanceTo(userAnswerLatLng),
          })
          .then(() => {
            isAnswered = quizStore.isAnswered();
            const step = $quizStore.step;
            const countStep = $quizStore.numberQuestions;
            const detail = EventTrackingService.getDetails(
              $quizStore.items,
              $quizStore.qItemId,
              event.detail.event
            );
            EventTrackingService.trackAnswer(
              detail.title,
              step,
              countStep,
              detail.element
            );
          });
      }
    } catch (err) {
      logMSGStore.set('Error in getResult: ' + err);
    }
  }

  function getLabelPositionAnswers(
    answer: MapPointGuessAnswer,
    userAnswerLatLng: LatLng,
    east: number,
    west: number
  ) {
    let correctAnswer;
    let userAnswer;
    if (answer.geometry.coordinates[1] > userAnswerLatLng.lat) {
      correctAnswer = 'top';
      userAnswer = 'bottom';
    } else {
      correctAnswer = 'bottom';
      userAnswer = 'top';
    }
    if (answer.geometry.coordinates[0] < west + (east - west) / 2) {
      correctAnswer += 'right';
    } else {
      correctAnswer += 'left';
    }
    if (userAnswerLatLng.lng < west + (east - west) / 2) {
      userAnswer += 'right';
    } else {
      userAnswer += 'left';
    }
    return { correctAnswer, userAnswer };
  }

  function eventSetMarker(markerPinIcon: L.DivIcon, e: L.LeafletMouseEvent) {
    if (!isAnswered) {
      // Add type annotation for the event parameter
      if (marker) {
        marker.setLatLng(e.latlng); // Add type assertion for the latlng parameter
      } else {
        marker = new L.Marker(e.latlng, {
          // Add type assertion for the latlng parameter
          icon: markerPinIcon,
          draggable: true,
        });
      }
      map.addLayer(marker);
      buttonDisabled = false;
    }
  }

  function mapFitBbox(map: Map, bbox: number[]) {
    if (!bbox) {
      return;
    }
    map.fitBounds([
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]],
    ]);
  }

  function setMapSize(map: L.Map) {
    let container = map.getContainer();
    container.style.height = `${map.getSize()['x'] * (9 / 16)}px`;
    map.invalidateSize();
  }
</script>

<BaseElement {element} {isAnswered}>
  <div class="q-quiz-input" style="widht: 100%; height: 100%">
    <div class="s-font-note-s s-font-note-s--light">
      Klicken Sie auf die gewünschte Stelle auf der Karte, um Ihre Antwort
      einzugeben.
    </div>
    <div id="map" bind:this={mapContainer} class="q-quiz-map-container"></div>
    {#if !isAnswered}
      <Button
        on:action={(event) => getResult(event)}
        bind:disabled={buttonDisabled}>Antworten</Button
      >
    {:else if marker}
      <Statistic {element} {map} userAnswer={marker} />
    {/if}
  </div>
</BaseElement>

<style lang="scss">
  .q-quiz-map-container {
    height: 300px;
    margin: 8px 0 16px 0;
  }
</style>
