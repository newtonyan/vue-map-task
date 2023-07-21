export type MapLocation = {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  marker?: google.maps.Marker;
};
