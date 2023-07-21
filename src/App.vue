<script setup lang="ts">
import { Ref, computed, onMounted, ref } from "vue";
import { addMarkerToMap, getCurrentGeolocation, updateMap, searchLocation } from "./utils.ts";
import { Loader } from "@googlemaps/js-api-loader";

let placesService: google.maps.places.PlacesService;

const locationInput: Ref<string> = ref("");

const getCurrentGelocationAndShowOnMap = async () => {
  try {
    if (!isMapInited.value) await initMap();

    const position = await getCurrentGeolocation();
    if (typeof position === "string") throw new Error(position);

    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
    const mapOptions: google.maps.MapOptions = {
      center: coords,
      zoom: 12,
    };

    if (isMapInited.value) {
      updateMap(mapRef.value!, mapOptions);
      addMarkerToMap(mapRef.value!, coords);
    }
  } catch (error) {
    alert(error);
  }
};

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAP_API,
  version: "weekly",
});

const mapRef = ref<google.maps.Map>();

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

const search = async () => {
  if (!isMapInited.value) await initMap();
  searchLocation(mapRef.value!, placesService, locationInput.value);
};

const isMapInited = computed(() => {
  return Boolean(mapRef && mapRef.value && placesService);
});

onMounted(() => {});
</script>

<template>
  <div>
    <button @click="getCurrentGelocationAndShowOnMap">Get current location</button>
  </div>
  <div>
    <input type="text" v-model="locationInput" />
    <button @click="search" :disabled="!locationInput">Search</button>
  </div>
  <div>Result for {{ locationInput }}</div>
  <div id="map" class="w-full h-96"></div>
</template>
./utils.ts
