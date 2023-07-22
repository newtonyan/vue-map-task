<script setup lang="ts">
import {
  Ref,
  computed,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
  watchEffect,
} from "vue";
import {
  addMarkerToMap,
  getCurrentGeolocation,
  updateMap,
  searchLocation,
  deleteMarker,
} from "./utils.ts";
import { Loader } from "@googlemaps/js-api-loader";
import ResultTable from "./components/ResultTable.vue";
import { MapLocation } from "./types";
import { MapPinIcon } from "@heroicons/vue/24/outline";

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
    mapId: "c49317e9231c023",
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
        if (!placesService)
          placesService = new google.maps.places.PlacesService(mapRef.value);
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

    const currentLocation = await getCurrentGeolocation();
    if (typeof currentLocation === "string") throw new Error(currentLocation);

    const position = {
      lat: currentLocation.coords.latitude,
      lng: currentLocation.coords.longitude,
    };
    const mapOptions: google.maps.MapOptions = {
      center: position,
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
    const mapLocation = await searchLocation(
      placesService,
      locationInputRef.value
    );

    if (mapLocationDataRef.value.some((data) => data.id === mapLocation.id)) {
      return alert("Location already existed!");
    }

    addMarkerToMap(mapRef.value!, mapLocation, markers);
    updateMap(mapRef.value!, { center: mapLocation.position, zoom: 15 });
    mapLocationDataRef.value = [mapLocation, ...mapLocationDataRef.value];
    locationInputRef.value = "";
  } catch (error) {}
};

const deleteMapLocationData = (
  ids: Array<string>,
  resetRowSelection: () => void
) => {
  mapLocationDataRef.value = mapLocationDataRef.value.filter(
    (data) => !ids.includes(data.id)
  );

  for (let id of ids) {
    const marker = markers.get(id);
    if (marker) marker.setMap(null);
  }
  resetRowSelection();
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
    mapLocationDataRef.value = JSON.parse(
      mapLocationDataLocal
    ) as Array<MapLocation>;
    for (let location of mapLocationDataRef.value) {
      addMarkerToMap(mapRef.value!, location, markers);
    }
  }

  // set watcher to save data to local storage whenever data changed
  watchEffect(() => {
    localStorage.setItem(
      "mapLocationData",
      JSON.stringify(mapLocationDataRef.value)
    );
  });
});
</script>

<template>
  <main>
    <div class="flex h-screen flex-col-reverse lg:flex-row">
      <aside
        class="flex h-full w-full flex-col justify-between border-r border-gray-300 bg-gray-50 lg:w-[40rem]"
      >
        <div class="px-8 py-4">
          <img src="./assets/vue.svg" class="mb-4 h-12 w-12" alt="Vue logo" />
          <div class="flex gap-2">
            <input
              type="text"
              v-model="locationInputRef"
              class="h-8 w-full rounded-lg"
              placeholder="Search location"
              @keyup.enter="search"
            />
            <button
              class="h-9 bg-teal-500 px-4 py-2 text-white hover:bg-teal-500/90"
              @click="search"
              :disabled="!locationInputRef"
            >
              Search
            </button>
          </div>
          <ResultTable
            class="mt-4"
            v-if="mapLocationDataRef && mapRef"
            :data="mapLocationDataRef"
            :map="mapRef"
            @delete="deleteMapLocationData"
          />
        </div>
        <div class="px-8 py-4">
          <button
            class="h-9 w-full gap-1 bg-gray-200 px-4 py-2 hover:bg-gray-200/80"
            @click="getCurrentGelocationAndShowOnMap"
          >
            <MapPinIcon class="h-5 w-5" />
            Your Location
          </button>
        </div>
      </aside>

      <div id="map" class="h-96 w-full lg:h-full"></div>
    </div>
  </main>
</template>
