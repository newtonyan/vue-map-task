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
