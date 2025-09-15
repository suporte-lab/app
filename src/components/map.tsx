import { MapContainer, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";

const styles = {
  minimal: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  colored:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

export function Map({
  center,
  zoom,
  children,
  locked,
  variant = "minimal",
}: {
  center: [number, number];
  zoom: number;
  children?: React.ReactNode;
  locked?: boolean;
  variant?: keyof typeof styles;
}) {
  return (
    <MapContainer
      dragging={!locked}
      scrollWheelZoom={!locked}
      doubleClickZoom={!locked}
      touchZoom={!locked}
      keyboard={!locked}
      //
      zoomControl={false} // hides the zoom buttons
      attributionControl={false} // hides the default attribution
      center={center}
      zoom={zoom}
      className="size-full"
    >
      <MapSizeChecker />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url={styles[variant]}
      />
      {children}
    </MapContainer>
  );
}

function MapSizeChecker() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, []);

  return null;
}
