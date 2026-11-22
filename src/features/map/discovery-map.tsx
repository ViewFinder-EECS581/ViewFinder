"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Compass,
  Crosshair,
  ListFilter,
  MapPin,
  Menu,
  Navigation,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { mockViewpoints, type Viewpoint } from "@/lib/mock-viewpoints";
import {
  fetchSubmittedViewpoints,
  getAllViewpoints,
  type SubmittedViewpoint,
} from "@/lib/viewpoint-store";
import { useAuthSession } from "@/lib/auth-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BaseMap } from "@/features/map/base-map";
import { getDirectionsUrl } from "@/features/viewpoints/directions";
import {
  getOnboardingDismissedSnapshot,
  rememberOnboardingDismissal,
  subscribeToOnboarding,
} from "@/features/map/onboarding";

const initialMapView = {
  longitude: mockViewpoints[0].longitude,
  latitude: mockViewpoints[0].latitude,
  zoom: 14.4,
  pitch: 55,
  bearing: -18,
};

export function DiscoveryMap() {
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  const auth = useAuthSession();
  const [selected, setSelected] = useState<Viewpoint>(mockViewpoints[0]);
  const [search, setSearch] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [submittedViewpoints, setSubmittedViewpoints] = useState<
    SubmittedViewpoint[]
  >([]);
  const [viewpointLoadError, setViewpointLoadError] = useState("");
  const [signOutError, setSignOutError] = useState("");
  const viewpoints = useMemo(
    () => getAllViewpoints(submittedViewpoints),
    [submittedViewpoints],
  );
  const onboardingDismissed = useSyncExternalStore(
    subscribeToOnboarding,
    getOnboardingDismissedSnapshot,
    () => true,
  );
  const onboardingOpen = !onboardingDismissed;
  const onboardingCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    void fetchSubmittedViewpoints()
      .then((submitted) => {
        if (active) setSubmittedViewpoints(submitted);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setViewpointLoadError(
          error instanceof Error
            ? error.message
            : "Could not load viewpoints from Supabase.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  const dismissOnboarding = useCallback(() => {
    try {
      rememberOnboardingDismissal(window.localStorage);
    } catch {
      // The modal can still be dismissed when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!onboardingOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    onboardingCloseRef.current?.focus();
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") dismissOnboarding();
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus();
    };
  }, [dismissOnboarding, onboardingOpen]);

  const visibleViewpoints = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return viewpoints;
    return viewpoints.filter((viewpoint) =>
      `${viewpoint.name} ${viewpoint.area}`.toLowerCase().includes(query),
    );
  }, [search, viewpoints]);

  function selectViewpoint(viewpoint: Viewpoint) {
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

  async function handleSignOut() {
    setSignOutError("");
    try {
      const { error } = await createSupabaseBrowserClient().auth.signOut();
      if (error) throw error;
      router.replace("/");
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Could not sign out.",
      );
    }
  }

  return (
    <main className="discovery-shell">
      {onboardingOpen && (
        <div className="onboarding-backdrop">
          <section
            aria-labelledby="onboarding-title"
            aria-modal="true"
            className="onboarding-modal"
            role="dialog"
          >
            <button
              aria-label="Close welcome guide"
              className="onboarding-close"
              onClick={dismissOnboarding}
              ref={onboardingCloseRef}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
            <p className="eyebrow">Welcome to ViewFinder</p>
            <h1 id="onboarding-title">Find a place worth slowing down for.</h1>
            <div className="onboarding-steps">
              <div className="onboarding-step">
                <span className="onboarding-icon">
                  <Compass aria-hidden="true" size={19} />
                </span>
                <div>
                  <strong>Explore the map</strong>
                  <p>Drag to move, pinch or scroll to zoom, and select a marker to view a place.</p>
                </div>
              </div>
              <div className="onboarding-step">
                <span className="onboarding-icon">
                  <SlidersHorizontal aria-hidden="true" size={19} />
                </span>
                <div>
                  <strong>Search and filter</strong>
                  <p>Use search or Filters to narrow down viewpoints and find a view that fits.</p>
                </div>
              </div>
              <div className="onboarding-step">
                <span className="onboarding-icon">
                  <MapPin aria-hidden="true" size={19} />
                </span>
                <div>
                  <strong>Share a viewpoint</strong>
                  <p>Select Upload, add a photo and location details, then share your good find.</p>
                </div>
              </div>
            </div>
            <button
              className="onboarding-primary"
              onClick={dismissOnboarding}
              type="button"
            >
              Explore the map
            </button>
          </section>
        </div>
      )}
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
          const isSelected = selected.id === viewpoint.id;
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
                aria-label={`View ${viewpoint.name}`}
                className={isSelected ? "map-marker selected" : "map-marker"}
                onClick={(event) => event.stopPropagation()}
                title={viewpoint.name}
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
          <Link className="quiet-button" href="/upload">
            <MapPin aria-hidden="true" size={16} />
            <span>Upload</span>
          </Link>
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
          {auth.status === "signed-in" ? (
            <button
              aria-label="Sign out"
              className="profile-chip"
              onClick={handleSignOut}
              type="button"
            >
              <span className="profile-avatar">
                {(auth.user.email?.[0] ?? "U").toUpperCase()}
              </span>
              <span>Sign out</span>
            </button>
          ) : (
            <Link
              aria-label="Sign in or create an account"
              className="profile-chip"
              href="/"
            >
              <span className="profile-avatar">G</span>
              <span>Sign in</span>
            </Link>
          )}
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
        {(viewpointLoadError ||
          signOutError ||
          (auth.status === "error" ? auth.error : "")) && (
          <p className="form-error map-data-error" role="alert">
            {viewpointLoadError ||
              signOutError ||
              (auth.status === "error" ? auth.error : "")}
          </p>
        )}

        <div className="place-list" aria-label="Nearby viewpoints">
          {visibleViewpoints.length === 0 ? (
            <div className="empty-search" role="status" aria-live="polite">
              <Search size={18} />
              <p>No places match that search.</p>
              <button type="button" onClick={() => setSearch("")}>
                Clear search
              </button>
            </div>
          ) : (
            visibleViewpoints.map((viewpoint, index) => (
              <button
                aria-pressed={selected.id === viewpoint.id}
                className={
                  selected.id === viewpoint.id
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
                  <strong>{viewpoint.name}</strong>
                  <span>{viewpoint.area.split(" · ")[0]}</span>
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

      <section
        aria-label={`Selected viewpoint: ${selected.name}`}
        className={listOpen ? "selected-card mobile-hidden" : "selected-card"}
      >
        <div
          aria-hidden="true"
          className="selected-image"
          style={{ backgroundImage: `url("${selected.image}")` }}
        >
          <span className="image-tag">
            <Compass size={13} />
            Worth the detour
          </span>
        </div>
        <div className="selected-content">
          <div className="selected-copy">
            <span className="eyebrow">{selected.area}</span>
            <h2>{selected.name}</h2>
            <p>{selected.note}</p>
          </div>
          <Link
            aria-label={`Open ${selected.name} detail`}
            className="round-arrow"
            href={`/viewpoints/${selected.id}`}
            title="Open viewpoint detail"
          >
            <ArrowUpRight size={18} />
          </Link>
          <a
            aria-label={`Get directions to ${selected.name}`}
            className="round-arrow directions-arrow"
            href={getDirectionsUrl(selected.latitude, selected.longitude)}
            rel="noopener noreferrer"
            target="_blank"
            title="Get directions"
          >
            <Navigation aria-hidden="true" size={16} />
          </a>
        </div>
      </section>

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
