<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import { getCurrentGeolocation, updateMap } from "./utils.ts";
import { Loader } from "@googlemaps/js-api-loader";

const locationInput: Ref<string> = ref("");

const searchLocation = () => {
  console.log(locationInput.value);
  loadMapToDOM();
};

const getCurrentGelocationAndShowOnMap = async () => {
  try {
    loadMapToDOM();

    const position = await getCurrentGeolocation();
    if (typeof position === "string") throw new Error(position);

    const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
    const mapOptions: google.maps.MapOptions = {
      center: coords,
      zoom: 12,
    };

    if (map.value) {
      updateMap(map.value, mapOptions);
      addMarkerToMap(map.value, coords);
    }
  } catch (error) {
    alert(error);
  }
};

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAP_API,
  version: "weekly",
});

const map = ref<google.maps.Map>();

const loadMapToDOM = (
  options: google.maps.MapOptions = {
    center: {
      lat: 0,
      lng: 0,
    },
    zoom: 4,
  }
) => {
  console.log("Load google map to DOM");
  // Load google map to DOM if map is not loaded yet
  if (!map.value) {
    loader.importLibrary("maps").then(({ Map }) => {
      map.value = new Map(document.getElementById("map")!, options);
    });
  }
};

const addMarkerToMap = (map: google.maps.Map, position: google.maps.LatLngLiteral) => {
  const marker = new google.maps.Marker({ position });
  marker.setMap(map);
};

onMounted(() => {});
</script>

<template>
  <div>
    <button @click="getCurrentGelocationAndShowOnMap">Get current location</button>
  </div>
  <div>
    <input type="text" v-model="locationInput" />
    <button @click="searchLocation" :disabled="!locationInput">Search</button>
  </div>
  <div>Result for {{ locationInput }}</div>
  <div id="map" class="w-full h-96"></div>
</template>
./utils.ts
