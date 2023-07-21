import { MapLocation } from "./types";

export const getCurrentGeolocation = () => {
  const isSupported = "navigator" in window && "geolocation" in navigator;

  return new Promise<GeolocationPosition | string>((resolve, reject) => {
    if (!isSupported) return reject("Geolocation not supported!");
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        return resolve(position);
      },
      (error: GeolocationPositionError) => {
        return reject(error.message);
      }
    );
  });
};

export const updateMap = (map: google.maps.Map, options: google.maps.MapOptions) => {
  map.setOptions(options);
};

export const searchLocation = (placesService: google.maps.places.PlacesService, query: string) => {
  return new Promise<MapLocation>((resolve, reject) => {
    if (!placesService) return reject(null); //TODO show error

    const request: google.maps.places.FindPlaceFromQueryRequest = {
      query: query,
      fields: ["name", "geometry", "place_id"],
    };

    placesService.findPlaceFromQuery(
      request,
      (results: Array<google.maps.places.PlaceResult> | null, status: google.maps.places.PlacesServiceStatus) => {
        console.log(results);
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results.length &&
          results[0].geometry &&
          results[0].geometry.location &&
          results[0].name &&
          results[0].place_id
        ) {
          // Assumption: use first result
          const location = results[0].geometry.location;
          const name = results[0].name;
          resolve({ id: results[0].place_id, name: name, position: location.toJSON() });
        } else {
          // TODO show no result
          alert("No result");
          reject();
        }
      }
    );
  });
};

export const addMarkerToMap = (
  map: google.maps.Map,
  mapLocation: MapLocation,
  markers: Map<string, google.maps.Marker>
) => {
  const marker = new google.maps.Marker({ position: mapLocation.position });
  marker.setMap(map);
  markers.set(mapLocation.id, marker);
};
