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

export const searchLocation = (
  map: google.maps.Map,
  placesService: google.maps.places.PlacesService,
  query: string
) => {
  if (!map || !placesService) return; //TODO show error

  const request = {
    query: query,
    fields: ["name", "geometry"],
  };

  placesService.findPlaceFromQuery(
    request,
    (results: Array<google.maps.places.PlaceResult> | null, status: google.maps.places.PlacesServiceStatus) => {
      console.log(results);
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length) {
        addMarkerToMap(map, results[0].geometry?.location!);
        map.setCenter(results[0].geometry?.location!);
      } else {
        // TODO show no result
        alert("No result");
      }
    }
  );
};

export const addMarkerToMap = (map: google.maps.Map, position: google.maps.LatLngLiteral | google.maps.LatLng) => {
  const marker = new google.maps.Marker({ position });
  marker.setMap(map);
};
