"use client";

import type { ReactNode, Ref } from "react";
import Map, {
  Layer,
  type LayerProps,
  type MapRef,
} from "react-map-gl/maplibre";
import type { FilterSpecification } from "maplibre-gl";

const mapStyle =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/liberty";

const buildingLayer: LayerProps = {
  id: "viewfinder-3d-buildings",
  type: "fill-extrusion",
  source: "openmaptiles",
  "source-layer": "building",
  minzoom: 13,
  filter: ["==", ["geometry-type"], "Polygon"] as FilterSpecification,
  paint: {
    "fill-extrusion-color": "#c7c9bd",
    "fill-extrusion-height": [
      "interpolate",
      ["linear"],
      ["zoom"],
      13,
      0,
      15,
      ["coalesce", ["get", "render_height"], ["get", "height"], 0],
    ],
    "fill-extrusion-base": [
      "coalesce",
      ["get", "render_min_height"],
      ["get", "min_height"],
      0,
    ],
    "fill-extrusion-opacity": 0.72,
  },
};

type BaseMapProps = {
  center: { longitude: number; latitude: number };
  zoom: number;
  pitch?: number;
  bearing?: number;
  mapRef?: Ref<MapRef>;
  children?: ReactNode;
  label?: string;
};

export function BaseMap({
  center,
  zoom,
  pitch = 55,
  bearing = -18,
  mapRef,
  children,
  label = "Interactive map",
}: BaseMapProps) {
  return (
    <Map
      ref={mapRef}
      aria-label={label}
      initialViewState={{ ...center, zoom, pitch, bearing }}
      mapStyle={mapStyle}
      maxPitch={65}
      minZoom={3}
      reuseMaps
      workerUrl="/maplibre-gl-worker.mjs"
      style={{ position: "absolute", inset: 0 }}
    >
      <Layer {...buildingLayer} />
      {children}
    </Map>
  );
}
