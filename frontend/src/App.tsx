import * as maplibregl from 'maplibre-gl';
import EarthScene from './scenes/EarthScene/EarthScene';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Layer = 'vegetation' | 'temperature' | 'air';

type Place = {
  name: string;
  region: string;
  lat: number;
  lng: number;
  note: string;
};

const places: Place[] = [
  {
    name: 'Chandigarh',
    region: 'Pilot city · North India',
    lat: 30.7333,
    lng: 76.7794,
    note: 'Our first study area. The NDVI calculation pipeline is ready; satellite observations still need to be sourced and processed.',
  },
  {
    name: 'Delhi',
    region: 'National Capital Territory',
    lat: 28.6139,
    lng: 77.209,
    note: 'A future comparison area. No environmental measurements have been loaded yet.',
  },
  {
    name: 'Jaipur',
    region: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    note: 'A future comparison area. No environmental measurements have been loaded yet.',
  },
  {
    name: 'Mumbai',
    region: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    note: 'A future comparison area. No environmental measurements have been loaded yet.',
  },
  {
    name: 'Bengaluru',
    region: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    note: 'A future comparison area. No environmental measurements have been loaded yet.',
  },
  {
    name: 'Kolkata',
    region: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    note: 'A future comparison area. No environmental measurements have been loaded yet.',
  },
];

const layerInfo: Record<
  Layer,
  { label: string; short: string; detail: string; status: string }
> = {
  vegetation: {
    label: 'Vegetation',
    short: 'NDVI',
    detail:
      'NDVI estimates vegetation greenness from near-infrared and red reflectance. It does not directly measure tree count or biodiversity.',
    status: 'Calculation ready · imagery not loaded',
  },
  temperature: {
    label: 'Surface heat',
    short: 'LST',
    detail:
      'Land-surface temperature is measured from satellite observations. It is not the same as air temperature or the temperature people feel.',
    status: 'Planned · no observations loaded',
  },
  air: {
    label: 'Air quality',
    short: 'AQI',
    detail:
      'Air-quality readings depend on monitoring-station coverage, measurement methods and reporting periods.',
    status: 'Planned · no station data loaded',
  },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

function IndiaMap({
  selected,
  onSelect,
  layer,
}: {
  selected: string;
  onSelect: (name: string) => void;
  layer: Layer;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, maplibregl.Marker>());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          imagery: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution:
              'Tiles © Esri, Maxar, Earthstar Geographics, and GIS User Community',
          },
          labels: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: 'Labels © Esri',
          },
        },
        layers: [
          {
            id: 'satellite-imagery',
            type: 'raster',
            source: 'imagery',
          },
          {
            id: 'geographic-labels',
            type: 'raster',
            source: 'labels',
            paint: {
              'raster-opacity': 0.9,
            },
          },
        ],
      },
      center: [79.5, 22.5],
      zoom: 4.2,
      minZoom: 3,
      maxZoom: 16,
      attributionControl: {
        compact: true,
      },
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      'top-right'
    );

    map.on('load', () => {
      places.forEach((place) => {
        const element = document.createElement('button');

        element.className = 'earthsignal-marker';
        element.type = 'button';
        element.setAttribute('aria-label', `Select ${place.name}`);
        element.dataset.label = place.name;

        if (place.name === 'Chandigarh') {
          element.classList.add('pilot-marker');
        }

        element.addEventListener('click', () => {
          onSelect(place.name);
        });

        const popupContent = document.createElement('div');
        popupContent.className = 'earthsignal-popup';

        const heading = document.createElement('strong');
        heading.textContent = place.name;

        const region = document.createElement('span');
        region.textContent = place.region;

        const note = document.createElement('p');
        note.textContent = place.note;

        popupContent.append(heading, region, note);

        const popup = new maplibregl.Popup({
          offset: 18,
          closeButton: false,
          maxWidth: '220px',
        }).setDOMContent(popupContent);

        const marker = new maplibregl.Marker({
          element,
          anchor: 'center',
        })
          .setLngLat([place.lng, place.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.set(place.name, marker);
      });

      setMapReady(true);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const selectedPlace =
      places.find((place) => place.name === selected) ?? places[0];

    mapRef.current.flyTo({
      center: [selectedPlace.lng, selectedPlace.lat],
      zoom: 5.2,
      duration: 1100,
      essential: true,
    });

    markersRef.current.forEach((marker, name) => {
      marker.getElement().classList.toggle(
        'active-marker',
        name === selected
      );
    });
  }, [selected, mapReady]);

  return (
    <div
      className="map-art"
      role="region"
      aria-label={`Satellite map of India. Selected lens: ${layerInfo[layer].label}`}
    >
      <div ref={containerRef} className="maplibre-map" />
    </div>
  );
}

function ScrollReveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = revealRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={revealRef} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState<
    'explore' | 'discover' | 'about'
  >('explore');
  const [selected, setSelected] = useState('Chandigarh');
  const [layer, setLayer] = useState<Layer>('vegetation');
  const [year, setYear] = useState(2024);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const [search, setSearch] = useState('');

  const place = places.find((p) => p.name === selected) ?? places[0];

  const filteredPlaces = useMemo(
    () =>
      places.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const enterExplore = () => {
    setActiveView('explore');
    document
      .getElementById('explorer')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          onClick={() => setActiveView('explore')}
        >
          <span className="brand-mark">◎</span>
          <span>
            EARTH<span className="brand-light">SIGNAL</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={activeView === 'explore' ? 'nav-active' : ''}
            onClick={() => {
              setActiveView('explore');
              enterExplore();
            }}
          >
            Explore
          </button>
          <button
            className={activeView === 'discover' ? 'nav-active' : ''}
            onClick={() => {
              setActiveView('discover');
              document
                .getElementById('discover')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Discover
          </button>
          <button
            className={activeView === 'about' ? 'nav-active' : ''}
            onClick={() => {
              setActiveView('about');
              document
                .getElementById('about')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            About the science
          </button>
        </nav>

        <a
          className="top-cta"
          href="#explorer"
          onClick={() => setActiveView('explore')}
        >
          Open the atlas <Arrow diagonal />
        </a>
      </header>

      <main id="top">
        {/* HERO — kept unchanged */}
        <section className="hero-section cosmos-hero">
          <div
            className="hero-visual cosmos-visual"
            aria-label="Interactive three-dimensional Earth with orbiting satellites"
          >
            <EarthScene />
          </div>

          <div className="cosmos-vignette" />

          <div className="cosmos-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              AN OPEN ATLAS OF A CHANGING INDIA
            </div>

            <h1>
              Read the
              <br />
              <em>living planet.</em>
            </h1>

            <p className="hero-lede">
              Every landscape holds a story. Earth Signal brings satellite
              observations closer, revealing how our world changes through time.
            </p>

            <div className="hero-actions">
              <button className="button-primary" onClick={enterExplore}>
                Enter the atlas <Arrow />
              </button>

              <a className="text-link" href="#about">
                Our science <Arrow diagonal />
              </a>
            </div>
          </div>

          <div className="cosmos-coordinate">
            <span>PLANETARY OBSERVATORY</span>
            <b>30°44′N · 76°47′E</b>
            <small>CHANDIGARH · INDIA</small>
          </div>

          <div className="cosmos-side-note">
            <span className="live-dot" />
            <div>
              <b>OBSERVE THE CHANGE</b>
              <small>From orbit to neighbourhood</small>
            </div>
          </div>

          <div className="cosmos-bottom">
            <span>EARTH SIGNAL / 001</span>
            <span>EXPLORE THE LIVING PLANET ↓</span>
            <span>BUILT ON EVIDENCE</span>
          </div>
        </section>

        {/* 01 — INDIA ATLAS */}
        <ScrollReveal>
          <section className="explorer-section" id="explorer">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> THE LIVING ATLAS{' '}
                  <span className="section-index">01</span>
                </div>
                <h2>
                  Start with a place.
                  <br />
                  <em>Follow its signal.</em>
                </h2>
              </div>
              <p className="section-aside">
                Choose a city, switch the lens, and explore what we can—and
                cannot—learn from Earth observation data.
              </p>
            </div>

            <div className="explorer-frame">
              <div className="explorer-topline">
                <div className="atlas-title">
                  <span className="atlas-symbol">⌖</span>
                  <div>
                    <b>INDIA FIELD ATLAS</b>
                    <small>GEOGRAPHIC OVERVIEW · EARLY ACCESS</small>
                  </div>
                </div>
                <div className="atlas-status">
                  <span className="status-dot" /> DATA ENGINE IN DEVELOPMENT
                </div>
              </div>

              <div className="explorer-body">
                <aside className="explorer-sidebar">
                  <label className="field-label" htmlFor="place-search">
                    FIND A PLACE
                  </label>

                  <div className="search-wrap">
                    <span>⌕</span>
                    <input
                      id="place-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search Indian cities"
                    />
                  </div>

                  <div className="place-list">
                    {filteredPlaces.map((p) => (
                      <button
                        key={p.name}
                        className={`place-option ${
                          selected === p.name ? 'selected' : ''
                        }`}
                        onClick={() => setSelected(p.name)}
                      >
                        <span className="place-marker">
                          {p.name === 'Chandigarh' ? '✳' : '·'}
                        </span>
                        <span>
                          {p.name}
                          <small>{p.region}</small>
                        </span>
                        <Arrow />
                      </button>
                    ))}
                    {filteredPlaces.length === 0 && (
                      <p className="empty-search">
                        No matching city in this starter atlas.
                      </p>
                    )}
                  </div>

                  <div className="sidebar-note">
                    <span>✳</span>
                    <p>
                      <b>Our first field study</b>
                      <br />
                      Chandigarh is the pilot area while we validate source data
                      and boundaries.
                    </p>
                  </div>
                </aside>

                <div className="map-stage">
                  <div className="map-toolbar">
                    <div>
                      <span className="tiny-label">REGION</span>
                      <b>INDIA</b>
                    </div>
                    <div className="map-toolbar-right">
                      <span className="tiny-label">VIEW</span>
                      <b>OVERVIEW</b>
                      <button
                        title="Reset selected city"
                        onClick={() => setSelected('Chandigarh')}
                      >
                        ↺
                      </button>
                    </div>
                  </div>

                  <IndiaMap
                    selected={selected}
                    onSelect={setSelected}
                    layer={layer}
                  />

                  <div className="map-legend">
                    <span>
                      <i className="legend-pilot" /> PILOT AREA
                    </span>
                    <span>
                      <i className="legend-city" /> CITY INDEX
                    </span>
                  </div>
                </div>

                <aside className="detail-panel">
                  <div className="detail-top">
                    <span className="tiny-label">SELECTED LOCATION</span>
                    <span className="location-number">ES / 001</span>
                  </div>

                  <h3>
                    {place.name}
                    <span className="detail-star">✳</span>
                  </h3>
                  <p className="place-region">{place.region}</p>

                  <div className="detail-rule" />
                  <div className="field-label">ENVIRONMENTAL LENS</div>

                  <div className="layer-switcher">
                    {(Object.keys(layerInfo) as Layer[]).map((key) => (
                      <button
                        key={key}
                        className={layer === key ? 'layer-active' : ''}
                        onClick={() => setLayer(key)}
                      >
                        <span>{layerInfo[key].short}</span>
                        {layerInfo[key].label}
                        {layer === key && <b>✓</b>}
                      </button>
                    ))}
                  </div>

                  <div className="signal-card">
                    <div className="signal-card-head">
                      <span className="tiny-label">SIGNAL STATUS</span>
                      <span className="status-pill">NOT YET MEASURED</span>
                    </div>

                    <div className="signal-placeholder">
                      <span className="placeholder-spark">✳</span>
                      <div>
                        <b>Awaiting observations</b>
                        <small>
                          We won't invent a reading where no validated dataset
                          exists.
                        </small>
                      </div>
                    </div>

                    <p className="layer-detail">{layerInfo[layer].detail}</p>
                  </div>

                  <div className="detail-bottom">
                    <div>
                      <span className="tiny-label">DATA AVAILABILITY</span>
                      <b>{layerInfo[layer].status}</b>
                    </div>
                    <button
                      className="evidence-button"
                      onClick={() => setEvidenceOpen(true)}
                    >
                      View methodology <Arrow diagonal />
                    </button>
                  </div>
                </aside>
              </div>

              <div className="timeline-bar">
                <div className="timeline-label">
                  <span className="tiny-label">TIME EXPLORER</span>
                  <b>{year}</b>
                </div>

                <div className="timeline-control">
                  <input
                    aria-label="Select year"
                    type="range"
                    min="2017"
                    max="2025"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  />
                  <div className="timeline-years">
                    <span>2017</span>
                    <span>2019</span>
                    <span>2021</span>
                    <span>2023</span>
                    <span>2025</span>
                  </div>
                </div>

                <span className="timeline-unavailable">
                  PERIOD SELECTION PREVIEW · NO OBSERVATIONS LOADED
                </span>
              </div>
            </div>

            <div className="explorer-caption">
              <span>FIG. 01 — AN INTERACTIVE INDEX OF PLACES</span>
              <span>Map artwork is schematic, not a boundary dataset.</span>
            </div>
          </section>
        </ScrollReveal>

        {/* 02 — DISCOVER */}
        <ScrollReveal>
          <section className="discover-section" id="discover">
            <div className="discover-intro">
              <div className="eyebrow">
                <span className="eyebrow-line" /> WHAT WE'RE BUILDING{' '}
                <span className="section-index">02</span>
              </div>
              <h2>
                Not just a map.
                <br />
                <em>A way to notice.</em>
              </h2>
              <p>
                Environmental data can feel distant. Earth Signal brings it
                closer—without flattening the complexity or hiding the
                uncertainty.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card feature-large">
                <div className="feature-illustration terrain-illustration">
                  <div className="terrain-sun" />
                  <div className="terrain-line line-a" />
                  <div className="terrain-line line-b" />
                  <div className="terrain-line line-c" />
                  <span className="illus-tag">01 / OBSERVE</span>
                </div>
                <div className="feature-copy">
                  <span>EXPLORE THE LAYERS</span>
                  <h3>
                    See the city
                    <br />
                    from another angle.
                  </h3>
                  <p>
                    Move between environmental lenses and discover what
                    satellite observations can reveal about a place.
                  </p>
                </div>
              </article>

              <article className="feature-card">
                <div className="feature-illustration time-illustration">
                  <div className="time-orbit">
                    <span>2017</span>
                    <b>↗</b>
                    <span>2025</span>
                  </div>
                  <div className="time-dots">··············</div>
                  <span className="illus-tag">02 / COMPARE</span>
                </div>
                <div className="feature-copy">
                  <span>TRAVEL THROUGH TIME</span>
                  <h3>
                    Change has
                    <br />
                    a timeline.
                  </h3>
                  <p>
                    Compare consistent observation periods and see where the
                    record has gaps.
                  </p>
                </div>
              </article>

              <article className="feature-card">
                <div className="feature-illustration signal-illustration">
                  <div className="signal-rings">
                    <i />
                    <i />
                    <i />
                    <b>!</b>
                  </div>
                  <span className="illus-tag">03 / INVESTIGATE</span>
                </div>
                <div className="feature-copy">
                  <span>FOLLOW AN UNUSUAL SIGNAL</span>
                  <h3>
                    Curiosity, meet
                    <br />
                    evidence.
                  </h3>
                  <p>
                    Investigate patterns with transparent methods. An anomaly
                    is a clue—not a conclusion.
                  </p>
                </div>
              </article>
            </div>
          </section>
        </ScrollReveal>

        {/* 03 — SCIENCE */}
        <ScrollReveal>
          <section className="science-section" id="about">
            <div className="science-art">
              <div className="science-orbit orbit-a" />
              <div className="science-orbit orbit-b" />
              <div className="science-core">
                ES<span>✳</span>
              </div>
              <div className="science-label label-a">SOURCE</div>
              <div className="science-label label-b">METHOD</div>
              <div className="science-label label-c">LIMITS</div>
            </div>

            <div className="science-copy">
              <div className="eyebrow">
                <span className="eyebrow-line" /> THE SCIENCE BEHIND THE SIGNAL{' '}
                <span className="section-index">03</span>
              </div>
              <h2>
                Beautiful visuals.
                <br />
                <em>Uncompromising receipts.</em>
              </h2>
              <p>
                Every finding should come with its source, observation date,
                spatial resolution, processing method, quality flags and
                uncertainty. If the data cannot support an answer, Earth Signal
                should say so.
              </p>
              <button
                className="button-dark"
                onClick={() => setEvidenceOpen(true)}
              >
                See our data principles <Arrow />
              </button>

              <div className="science-principles">
                <span>
                  <b>01</b> Traceable sources
                </span>
                <span>
                  <b>02</b> Honest data gaps
                </span>
                <span>
                  <b>03</b> No invented certainty
                </span>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* 04 — CLOSING */}
        <ScrollReveal>
          <section className="closing-section">
            <div className="closing-orb">✳</div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> THE FIRST SIGNAL STARTS HERE
            </div>
            <h2>
              Look closer.
              <br />
              <em>Understand more.</em>
            </h2>
            <button className="button-primary" onClick={enterExplore}>
              Return to the atlas <Arrow />
            </button>
            <p>EARTH SIGNAL · AN INDEPENDENT LEARNING PROJECT</p>
          </section>
        </ScrollReveal>
      </main>

      <footer className="footer">
        <a className="brand" href="#top">
          <span className="brand-mark">◎</span>
          <span>
            EARTH<span className="brand-light">SIGNAL</span>
          </span>
        </a>
        <span>READ THE LIVING PLANET.</span>
        <span>BUILT WITH CURIOSITY & CARE · 2026</span>
      </footer>

      {evidenceOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setEvidenceOpen(false)}
        >
          <section
            className="evidence-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setEvidenceOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="eyebrow">
              <span className="eyebrow-line" /> METHODS NOTE
            </div>
            <h2 id="evidence-title">What this layer can tell us.</h2>
            <p>{layerInfo[layer].detail}</p>

            <div className="method-row">
              <span>Selected lens</span>
              <b>
                {layerInfo[layer].label} ({layerInfo[layer].short})
              </b>
            </div>
            <div className="method-row">
              <span>Current status</span>
              <b>{layerInfo[layer].status}</b>
            </div>
            <div className="method-row">
              <span>Study location</span>
              <b>{place.name}</b>
            </div>

            <div className="method-note">
              The current build contains the NDVI calculation function and unit
              tests, but no source satellite scenes or validated city
              observations. The timeline and map are interactive interface
              previews—not measured environmental results.
            </div>

            <button
              className="button-dark modal-done"
              onClick={() => setEvidenceOpen(false)}
            >
              Back to exploring <Arrow />
            </button>
          </section>
        </div>
      )}

      {compare && (
        <div className="compare-toast">
          Comparison mode is planned for the next build.{' '}
          <button onClick={() => setCompare(false)}>Dismiss</button>
        </div>
      )}

      <button
        className="compare-fab"
        onClick={() => setCompare(true)}
        title="Compare places"
      >
        ⇄ <span>Compare</span>
      </button>

      <style>{`
        /* SCROLL REVEAL */

        .scroll-reveal {
          opacity: 0;
          transform: translateY(34px);
          transition:
            opacity 850ms cubic-bezier(0.2, 0.65, 0.3, 1),
            transform 850ms cubic-bezier(0.2, 0.65, 0.3, 1);
          will-change: opacity, transform;
        }

        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }

        /* EARTH SIGNAL — SATELLITE ATLAS */

        .map-art {
          position: relative;
          width: 100%;
          height: min(68vh, 620px);
          min-height: 460px;
          overflow: hidden;
          background: #101b1b;
        }

        .maplibre-map {
          width: 100%;
          height: 100%;
        }

        .maplibre-map .maplibregl-canvas {
          outline: none;
        }

        .maplibre-map .maplibregl-ctrl-group {
          background: rgba(9, 20, 19, 0.92);
          border: 1px solid rgba(217, 184, 121, 0.3);
          border-radius: 5px;
          overflow: hidden;
        }

        .maplibre-map .maplibregl-ctrl-group button {
          filter: invert(0.85);
        }

        .maplibre-map .maplibregl-ctrl-attrib {
          background: rgba(5, 12, 13, 0.75);
          color: #e4dfd0;
        }

        .maplibre-map .maplibregl-ctrl-attrib a {
          color: #d9b879;
        }

        .earthsignal-marker {
          position: relative;
          width: 20px;
          height: 20px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }

        .earthsignal-marker::before {
          content: '';
          position: absolute;
          inset: 5px;
          border: 1px solid #e8e2ca;
          border-radius: 50%;
          background: #7f9d84;
          box-shadow: 0 0 9px rgba(160, 196, 155, 0.7);
        }

        .earthsignal-marker.pilot-marker::before {
          background: #d9b879;
          box-shadow: 0 0 12px rgba(217, 184, 121, 0.85);
        }

        .earthsignal-marker.active-marker::before {
          inset: 3px;
          border: 2px solid #fff0cb;
          background: #d9b879;
          box-shadow:
            0 0 0 5px rgba(217, 184, 121, 0.22),
            0 0 16px rgba(217, 184, 121, 0.8);
        }

        .earthsignal-marker::after {
          content: attr(data-label);
          position: absolute;
          left: 50%;
          bottom: 22px;
          transform: translateX(-50%);
          padding: 4px 7px;
          white-space: nowrap;
          border: 1px solid rgba(217, 184, 121, 0.35);
          border-radius: 3px;
          background: rgba(8, 17, 17, 0.88);
          color: #f0ead9;
          font-family: inherit;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          pointer-events: none;
        }

        .earthsignal-popup {
          display: flex;
          flex-direction: column;
          gap: 5px;
          color: #26372f;
          font-family: inherit;
        }

        .earthsignal-popup strong {
          font-size: 14px;
        }

        .earthsignal-popup span {
          font-size: 11px;
          opacity: 0.75;
        }

        .earthsignal-popup p {
          margin: 3px 0 0;
          font-size: 12px;
          line-height: 1.5;
        }

        .maplibregl-popup-content {
          padding: 12px 14px;
          border-radius: 5px;
        }

        @media (max-width: 700px) {
          .map-art {
            height: 460px;
            min-height: 460px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;