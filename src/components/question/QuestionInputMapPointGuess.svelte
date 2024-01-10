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
