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

export const updateMap = (
  map: google.maps.Map,
  options: google.maps.MapOptions
) => {
  map.setOptions(options);
};

export const searchLocation = (
  placesService: google.maps.places.PlacesService,
  query: string
) => {
  return new Promise<MapLocation>((resolve, reject) => {
    if (!placesService) return reject(null); //TODO show error

    const request: google.maps.places.FindPlaceFromQueryRequest = {
      query: query,
      fields: ["name", "geometry", "place_id"],
    };

    placesService.findPlaceFromQuery(
      request,
      (
        results: Array<google.maps.places.PlaceResult> | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
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
          const placeId = results[0].place_id;
          placesService.getDetails(
            { placeId, fields: ["utc_offset_minutes"] },
            (
              result: google.maps.places.PlaceResult | null,
              status: google.maps.places.PlacesServiceStatus
            ) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                result &&
                result.utc_offset_minutes
              ) {
                console.log(result);
                resolve({
                  id: placeId,
                  name: name,
                  position: location.toJSON(),
                  utc_offset_minutes: result.utc_offset_minutes,
                });
              }
            }
          );
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

export const utcOffsetToString = (offset: number) => {
  const hour = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
  return offset < 0 ? `-${hour}:${minutes}` : `+${hour}:${minutes}`;
};
