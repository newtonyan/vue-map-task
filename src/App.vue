<script setup lang="ts">
import { Ref, computed, onMounted, reactive, ref, toRefs, watch, watchEffect } from "vue";
import { addMarkerToMap, getCurrentGeolocation, updateMap, searchLocation, deleteMarker } from "./utils.ts";
import { Loader } from "@googlemaps/js-api-loader";
import ResultTable from "./components/ResultTable.vue";
import { MapLocation } from "./types";

/* Ref */
const mapRef = ref<google.maps.Map>();
const locationInputRef: Ref<string> = ref("");
const mapLocationDataRef = ref<Array<MapLocation>>([]);

/* Constant / Variable */
let placesService: google.maps.places.PlacesService;
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAP_API,
  version: "weekly",
});

let markers = new Map<string, google.maps.Marker>();

/* Functions */
const initMap = (
  options: google.maps.MapOptions = {
    center: {
      lat: 0,
      lng: 0,
    },
    zoom: 4,
  }
) => {
  return new Promise<void>((resolve, reject) => {
    if (isMapInited.value) resolve();
    // Load google map to DOM if map is not loaded yet
    loader.importLibrary("places");
    loader
      .importLibrary("maps")
      .then(({ Map }) => {
        mapRef.value = new Map(document.getElementById("map")!, options);
        if (!placesService) placesService = new google.maps.places.PlacesService(mapRef.value);
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });
};

const getCurrentGelocationAndShowOnMap = async () => {
  try {
    if (!isMapInited.value) await initMap();

    const position = await getCurrentGeolocation();
    if (typeof position === "string") throw new Error(position);

    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
    const mapOptions: google.maps.MapOptions = {
      center: coords,
      zoom: 15,
    };

    if (isMapInited.value) {
      updateMap(mapRef.value!, mapOptions);
    }
  } catch (error) {
    alert(error);
  }
};

const search = async () => {
  if (!isMapInited.value) await initMap();
  try {
    if (!isMapInited.value) return; // TODO show error
    const mapLocation = await searchLocation(placesService, locationInputRef.value);
    addMarkerToMap(mapRef.value!, mapLocation, markers);
    updateMap(mapRef.value!, { center: mapLocation.position, zoom: 15 });
    mapLocationDataRef.value = [mapLocation, ...mapLocationDataRef.value];
  } catch (error) {}
};

const deleteMapLocationData = (ids: Array<string>) => {
  mapLocationDataRef.value = mapLocationDataRef.value.filter((data) => !ids.includes(data.id));

  for (let id of ids) {
    const marker = markers.get(id);
    if (marker) marker.setMap(null);
  }
};

/* Computed */
const isMapInited = computed(() => {
  return Boolean(mapRef && mapRef.value && placesService);
});

onMounted(async () => {
  await initMap();

  // get map location data from local storage
  const mapLocationDataLocal = localStorage.getItem("mapLocationData");
  if (mapLocationDataLocal) {
    mapLocationDataRef.value = JSON.parse(mapLocationDataLocal) as Array<MapLocation>;
    for (let location of mapLocationDataRef.value) {
      addMarkerToMap(mapRef.value!, location, markers);
    }
  }

  // set watcher to save data to local storage whenever data changed
  watchEffect(() => {
    localStorage.setItem("mapLocationData", JSON.stringify(mapLocationDataRef.value));
  });
});
</script>

<template>
  <div>
    <button @click="getCurrentGelocationAndShowOnMap">Get current location</button>
  </div>
  <div>
    <input type="text" v-model="locationInputRef" />
    <button @click="search" :disabled="!locationInputRef">Search</button>
  </div>
  <div>Result for {{ locationInputRef }}</div>
  <div id="map" class="w-full h-96"></div>
  <ResultTable v-if="mapLocationDataRef.length" :data="mapLocationDataRef" @delete="deleteMapLocationData" />
  <!-- <pre>{{ mapLocationDataRef }}</pre> -->
</template>
