<script lang="ts">
  import { onMount } from 'svelte';
  import '../services/leafle-heatmap.cjs';
  import simpleheat from '../services/simpleheat.cjs';
  import type { MapPointGuessStatistic } from '@src/interfaces';

  export let data: MapPointGuessStatistic[];
  export let map: L.Map;

  onMount(() => {
    // taken from https://github.com/pa7/heatmap.js (MIT-licensed)

    //@ts-ignore
    L.heatLayer(
      simpleheat,
      data.map((p) => {
        return [p.latLng.lat, p.latLng.lng];
      })
    ).addTo(map);
  });
</script>
