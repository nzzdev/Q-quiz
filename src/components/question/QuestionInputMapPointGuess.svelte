<script lang="ts">
  import L, { Marker, type LatLng, type Map } from 'leaflet';

  import type {
    Enrico,
    MapConfiguration,
    MapPointGuess,
  } from '@src/interfaces';
  import iconPinSvg from '../../resources/icon-pin.svg';
  import { onMount } from 'svelte';

  export let element: MapPointGuess;
  export let mapConfiguration: MapConfiguration;
  export let enrico: Enrico;

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

  let mapContainer: HTMLElement;
  let blaContainer: HTMLElement;
  let answarButton: HTMLButtonElement;
  let map: Map;
  let mapBounds: L.LatLngBounds;
  let marker: Marker<any> | null = null;

  onMount(() => {
    map = L.map(mapContainer, mapOptions);

    mapFitBbox(map, element.answer.bbox);
    setMapSize(map);
    map.attributionControl.setPrefix('');

    L.tileLayer(mapConfiguration.styleUrl, {
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

    map.on('click', (e: L.LeafletMouseEvent) => {
      // Add type annotation for the event parameter
      if (marker) {
        marker.setLatLng(e.latlng as LatLng); // Add type assertion for the latlng parameter
      } else {
        marker = new L.Marker(e.latlng as LatLng, {
          // Add type assertion for the latlng parameter
          icon: markerPinIcon,
          draggable: true,
        });
      }
      map.addLayer(marker);
    });
  });

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

<div
  bind:this={blaContainer}
  class="q-quiz-input"
  style="widht: 100%; height: 100%"
>
  <div class="s-font-note-s s-font-note-s--light">
    Klicken Sie auf die gewünschte Stelle auf der Karte, um Ihre Antwort
    einzugeben.
  </div>
  <div
    id="map"
    bind:this={mapContainer}
    class="q-quiz-map-container"
    style="height: 300px;"
  ></div>
  <button class="s-button s-button--small q-quiz-answer-button">
    <span>Antworten</span>
  </button>
</div>

<!-- <div class="q-quiz-result state-hidden">
  <div class="q-quiz-map-container" style="height: 300px"></div>
  <p class="q-quiz-result-answer-text s-font-text-s"></p>
</div> -->
<style lang="scss">
  .q-quiz-map-container {
    margin: 8px 0 16px 0;
  }

  .q-quiz-map-marker {
    border-radius: 50%;
    box-sizing: content-box;
    background: currentColor;
    position: relative;

    box-shadow: 0px 0px 0px 2px rgba(250, 250, 250, 0.9);
  }

  $q-quiz-marker-label-distance-to-point: 18px;
  $q-quiz-marker-label-height: 20px;
  .q-quiz-map-marker__label {
    position: absolute;
    word-break: nowrap;
    white-space: nowrap;
    line-height: $q-quiz-marker-label-height;

    text-shadow:
      rgb(250, 250, 250) 2px 0px 0px,
      rgb(250, 250, 250) 1.75517px 0.958851px 0px,
      rgb(250, 250, 250) 1.0806px 1.68294px 0px,
      rgb(250, 250, 250) 0.141474px 1.99499px 0px,
      rgb(250, 250, 250) -0.832294px 1.81859px 0px,
      rgb(250, 250, 250) -1.60229px 1.19694px 0px,
      rgb(250, 250, 250) -1.97998px 0.28224px 0px,
      rgb(250, 250, 250) -1.87291px -0.701566px 0px,
      rgb(250, 250, 250) -1.30729px -1.5136px 0px,
      rgb(250, 250, 250) -0.421592px -1.95506px 0px,
      rgb(250, 250, 250) 0.567324px -1.91785px 0px,
      rgb(250, 250, 250) 1.41734px -1.41108px 0px,
      rgb(250, 250, 250) 1.92034px -0.558831px 0px;

    &--topright {
      left: 0;
      top: -$q-quiz-marker-label-distance-to-point;
      text-align: left;
    }
    &--topleft {
      right: 0;
      top: -$q-quiz-marker-label-distance-to-point;
      text-align: right;
    }
    &--bottomright {
      left: 0;
      bottom: -$q-quiz-marker-label-distance-to-point;
      text-align: left;
    }
    &--bottomleft {
      right: 0;
      bottom: -$q-quiz-marker-label-distance-to-point;
      text-align: right;
    }
  }
</style>
