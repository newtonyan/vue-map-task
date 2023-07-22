<script setup lang="ts">
import { Ref, computed, onMounted, ref, watchEffect } from "vue";
import {
  addMarkerToMap,
  getCurrentGeolocation,
  updateMap,
  searchLocation,
} from "./utils.ts";
import { Loader } from "@googlemaps/js-api-loader";
import ResultTable from "./components/ResultTable.vue";
import { MapLocation } from "./types";
import { MapPinIcon } from "@heroicons/vue/24/outline";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
dayjs.extend(utc);

/* Ref */
const mapRef = ref<google.maps.Map>();
const locationInputRef: Ref<string> = ref("");
const mapLocationDataRef = ref<Array<MapLocation>>([]);
const now = ref("Loading...");
const isSearching = ref(false);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isDesktop = breakpoints.greater("lg");

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
    mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
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
  } catch (error: any) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert(error);
    }
  }
};

const search = async () => {
  if (!isMapInited.value) await initMap();
  try {
    if (!isMapInited.value) throw new Error("Map not found!");
    isSearching.value = true;
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
  } catch (error: any) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Something went wrong!");
    }
  } finally {
    isSearching.value = false;
  }
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

const lastSearchedLocationTimezone = computed(() => {
  return mapLocationDataRef?.value?.[0]?.utc_offset_minutes;
});

const isDataEmpty = computed(() => {
  return !mapLocationDataRef.value || !mapLocationDataRef.value.length;
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

  setInterval(() => {
    if (lastSearchedLocationTimezone.value) {
      now.value = dayjs()
        .utcOffset(lastSearchedLocationTimezone.value)
        ?.format("YYYY-MM-DD HH:mm:ss UTCZ");
    }
  }, 1000);
});
</script>

<template>
  <main>
    <div class="flex min-h-screen flex-col lg:h-screen lg:flex-row">
      <aside
        class="flex h-full w-full flex-1 flex-col justify-between border-r border-gray-300 bg-gray-50 lg:w-[40rem] lg:flex-auto lg:overflow-y-auto"
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
              :disabled="isSearching"
            />
            <button
              class="h-9 bg-teal-500 px-4 py-2 text-white hover:bg-teal-500/90"
              @click="search"
              :disabled="!locationInputRef || isSearching"
            >
              <svg
                v-if="isSearching"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-loader-2 animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Search</span>
            </button>
          </div>
          <div class="portal mt-8 block h-96 w-full lg:hidden"></div>
          <button
            class="mt-4 h-9 w-full gap-1 bg-gray-200 px-4 py-2 hover:bg-gray-200/80"
            @click="getCurrentGelocationAndShowOnMap"
          >
            <MapPinIcon class="h-5 w-5" />
            Current Location
          </button>
          <div>
            <h2 class="mt-4 text-lg font-bold leading-10">Local Time</h2>
            <div v-if="!isDataEmpty">
              <p>{{ mapLocationDataRef[0]?.name }}</p>
              <p>{{ now }}</p>
            </div>
            <div v-if="isDataEmpty">
              <p>
                You haven't saved any location. This will show the local time
                and timezone of your latest searched location.
              </p>
            </div>
          </div>
          <ResultTable
            class="mt-4"
            v-if="mapLocationDataRef && mapRef"
            :data="mapLocationDataRef"
            :map="mapRef"
            @delete="deleteMapLocationData"
          />
        </div>
      </aside>
      <div class="portal-desktop hidden h-96 w-full lg:block lg:h-full"></div>
    </div>
  </main>
  <Teleport :to="isDesktop ? '.portal-desktop' : '.portal'">
    <div id="map" class="h-96 w-full lg:h-full"></div>
  </Teleport>
</template>
