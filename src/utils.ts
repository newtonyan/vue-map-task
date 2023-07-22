import { MapLocation } from "./types";

export const getCurrentGeolocation = () => {
  const isSupported = "navigator" in window && "geolocation" in navigator;

  return new Promise<GeolocationPosition | string>((resolve, reject) => {
    if (!isSupported) return reject(new Error("Geolocation not supported!"));
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        return resolve(position);
      },
      (error: GeolocationPositionError) => {
        return reject(new Error(error.message));
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
    if (!placesService) return reject(new Error("Place Service is null"));

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
        if (status !== google.maps.places.PlacesServiceStatus.OK)
          return reject(new Error("Find Place Error!"));
        if (!results || !results.length) return reject(new Error("No result!"));
        if (
          !results[0].geometry ||
          !results[0].geometry.location ||
          !results[0].name ||
          !results[0].place_id
        )
          return reject(new Error("Result missing info!"));

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
            if (status !== google.maps.places.PlacesServiceStatus.OK || !result)
              return reject(new Error("Get Details Error!"));
            if (!result.utc_offset_minutes)
              return reject(new Error("Get Details missing info!"));

            return resolve({
              id: placeId,
              name: name,
              position: location.toJSON(),
              utc_offset_minutes: result.utc_offset_minutes,
            });
          }
        );
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
