"use client";

import { useMemo, useRef, useState } from "react";
import { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Crosshair,
  ListFilter,
  MapPin,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { ViewpointWithPhotos } from "@/lib/viewpoints/types";
import { BaseMap } from "@/features/map/base-map";

// Downtown Lawrence; the map opens here even when there are no viewpoints.
const initialMapView = {
  longitude: -95.2359095,
  latitude: 38.9497772,
  zoom: 14.4,
  pitch: 55,
  bearing: -18,
};

const formatCoordinates = (viewpoint: ViewpointWithPhotos) =>
  `${viewpoint.latitude.toFixed(4)}, ${viewpoint.longitude.toFixed(4)}`;

export function DiscoveryMap({
  viewpoints,
}: {
  viewpoints: ViewpointWithPhotos[];
}) {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<ViewpointWithPhotos | null>(
    viewpoints[0] ?? null,
  );
  const [search, setSearch] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visibleViewpoints = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return viewpoints;
    return viewpoints.filter((viewpoint) =>
      `${viewpoint.title} ${viewpoint.description}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, viewpoints]);

  function selectViewpoint(viewpoint: ViewpointWithPhotos) {
    setSelected(viewpoint);
    mapRef.current?.flyTo({
      center: [viewpoint.longitude, viewpoint.latitude],
      zoom: 14.5,
      pitch: 55,
      bearing: -18,
      duration: 900,
    });
    setListOpen(false);
  }

  return (
    <main className="discovery-shell">
      <BaseMap
        mapRef={mapRef}
        center={{
          longitude: initialMapView.longitude,
          latitude: initialMapView.latitude,
        }}
        label="Interactive map of Lawrence, Kansas viewpoints"
        pitch={initialMapView.pitch}
        zoom={initialMapView.zoom}
        bearing={initialMapView.bearing}
      >
        {viewpoints.map((viewpoint, index) => {
          const isSelected = selected?.id === viewpoint.id;
          return (
            <Marker
              anchor="bottom"
              key={viewpoint.id}
              latitude={viewpoint.latitude}
              longitude={viewpoint.longitude}
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                selectViewpoint(viewpoint);
              }}
            >
              <button
                aria-label={`View ${viewpoint.title}`}
                className={isSelected ? "map-marker selected" : "map-marker"}
                onClick={(event) => event.stopPropagation()}
                title={viewpoint.title}
                type="button"
              >
                {isSelected ? (
                  <MapPin aria-hidden="true" size={18} />
                ) : (
                  <span>{String(index + 1).padStart(2, "0")}</span>
                )}
              </button>
            </Marker>
          );
        })}
        <div className="map-navigation">
          <NavigationControl showCompass={false} visualizePitch />
        </div>
      </BaseMap>

      <header className="map-topbar">
        <Link
          className="wordmark map-wordmark"
          href="/"
          aria-label="ViewFinder home"
        >
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>viewfinder</span>
        </Link>
        <div className="map-search">
          <Search aria-hidden="true" size={17} />
          <input
            aria-label="Search places"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find somewhere…"
            value={search}
          />
        </div>
        <div className="topbar-actions">
          <button
            aria-expanded={filtersOpen}
            className={filtersOpen ? "quiet-button active" : "quiet-button"}
            onClick={() => setFiltersOpen(!filtersOpen)}
            type="button"
          >
            <SlidersHorizontal aria-hidden="true" size={16} />
            <span>Filters</span>
          </button>
          <span className="topbar-divider" />
          <Link
            aria-label="Sign in or create an account"
            className="profile-chip"
            href="/"
          >
            <span className="profile-avatar">G</span>
            <span>Sign in</span>
          </Link>
        </div>
        <button
          aria-label="Open places list"
          aria-expanded={listOpen}
          className="mobile-list-toggle"
          onClick={() => setListOpen(!listOpen)}
          type="button"
        >
          {listOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {filtersOpen && (
        <div className="filter-popover">
          <div>
            <strong>Find your kind of view</strong>
            <p>These filters are a preview for now.</p>
          </div>
          <div className="filter-options">
            <button disabled type="button">
              Water
            </button>
            <button disabled type="button">
              Forest
            </button>
            <button disabled type="button">
              City lights
            </button>
          </div>
        </div>
      )}

      <aside className={`place-panel${listOpen ? " open" : ""}`}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">A good place to start</p>
            <h1>Lawrence, Kansas</h1>
          </div>
        </div>
        <p className="panel-subtitle">
          A few favorite places, shared by locals.
        </p>

        <div className="place-list" aria-label="Nearby viewpoints">
          {visibleViewpoints.length === 0 ? (
            <div className="empty-search">
              <Search size={18} />
              <p>No places match that search.</p>
            </div>
          ) : (
            visibleViewpoints.map((viewpoint, index) => (
              <button
                aria-pressed={selected?.id === viewpoint.id}
                className={
                  selected?.id === viewpoint.id
                    ? "place-row selected"
                    : "place-row"
                }
                key={viewpoint.id}
                onClick={() => selectViewpoint(viewpoint)}
                type="button"
              >
                <span className="place-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="place-row-copy">
                  <strong>{viewpoint.title}</strong>
                  <span>{formatCoordinates(viewpoint)}</span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="place-arrow"
                  size={16}
                />
              </button>
            ))
          )}
        </div>

        <button
          className="panel-footer-button"
          onClick={() => setListOpen(false)}
          type="button"
        >
          <Sparkles aria-hidden="true" size={15} />
          <span>Showing places to slow down</span>
        </button>
      </aside>

      {selected && (
        <section
          aria-label={`Selected viewpoint: ${selected.title}`}
          className={listOpen ? "selected-card mobile-hidden" : "selected-card"}
        >
          <div
            aria-hidden="true"
            className="selected-image"
            style={
              selected.photos[0]
                ? { backgroundImage: `url("${selected.photos[0].url}")` }
                : undefined
            }
          >
            <span className="image-tag">
              <Compass size={13} />
              Worth the detour
            </span>
          </div>
          <div className="selected-content">
            <div className="selected-copy">
              <span className="eyebrow">{formatCoordinates(selected)}</span>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
            </div>
            <button
              aria-label="Center map on selected place"
              className="round-arrow"
              onClick={() => selectViewpoint(selected)}
              title="Center map on selected place"
              type="button"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>
      )}

      <div className="map-tools">
        <button
          aria-label="Return to map center"
          className="icon-button locate-button"
          onClick={() =>
            mapRef.current?.flyTo({
              center: [initialMapView.longitude, initialMapView.latitude],
              zoom: initialMapView.zoom,
              pitch: initialMapView.pitch,
              bearing: initialMapView.bearing,
              duration: 900,
            })
          }
          title="Return to Lawrence"
          type="button"
        >
          <Crosshair size={17} />
        </button>
      </div>

      <div className="map-caption">
        <ListFilter aria-hidden="true" size={13} />
        <span>Small finds, close to home</span>
      </div>
    </main>
  );
}
