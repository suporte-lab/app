import { APIProvider, Map } from "@vis.gl/react-google-maps";

const mapStyle = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
];

export function InteractiveMap() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={{ lat: -23.9608, lng: -46.3336 }} // Santos, Brasil
        defaultZoom={12}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        styles={mapStyle}
      />
    </APIProvider>
  );
}
