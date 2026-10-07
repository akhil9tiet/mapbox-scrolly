import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PathLayer } from '@deck.gl/layers';
import Lenis from 'lenis';
import { Marker } from 'react-map-gl/maplibre';
import { DeckOverlay, MapCanvas } from './components/map';
import { ViewState } from './types';
import 'lenis/dist/lenis.css';
import './App.css';

type Coordinate = [longitude: number, latitude: number];
type RoadStep = { name: string; distance: number };
type RouteData = {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  steps: RoadStep[];
};

const TWIN_PEAKS: Coordinate = [-122.4476, 37.7545];
const GOLDEN_GATE: Coordinate = [-122.47498, 37.80778];
const EMPTY_ROUTE: Coordinate[] = [];
const SCROLL_EASING = (progress: number) => 1 - Math.pow(1 - progress, 4);

const chapters = [
  {
    eyebrow: '01 / GET ORIENTED',
    title: 'Start with the whole picture.',
    copy: 'See where the drive begins and ends before the journey starts. The destination is clear from the first frame.',
  },
  {
    eyebrow: '02 / FOLLOW THE ROAD',
    title: 'Roads, not a guess.',
    copy: 'The route follows the drivable street network. Its current street name updates as the story moves.',
  },
  {
    eyebrow: '03 / KEEP YOUR PLACE',
    title: 'Never lose your bearings.',
    copy: 'The map stays in view while the story changes. Read the next moment without giving up your place in the city.',
  },
  {
    eyebrow: '04 / CHANGE THE SCALE',
    title: 'Give each place some room.',
    copy: 'The camera shifts with the route. Street detail gives way to a wider view as the Golden Gate draws near.',
  },
  {
    eyebrow: '05 / ARRIVE',
    title: 'Let the destination land.',
    copy: 'The Golden Gate gets its own moment before the full route resolves. The story has a clear end point.',
  },
  {
    eyebrow: '06 / YOUR PACE',
    title: 'Scroll, or choose a chapter.',
    copy: 'The journey follows your pace. Scroll to travel, tap a chapter to jump, or replay the route from the start.',
  },
];

const ROUTE_URL = `https://router.project-osrm.org/route/v1/driving/${TWIN_PEAKS.join(',')};${GOLDEN_GATE.join(',')}?overview=full&geometries=geojson&steps=true`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const segmentLengthKm = ([lon1, lat1]: Coordinate, [lon2, lat2]: Coordinate) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(lat2 - lat1);
  const longitudeDelta = radians(lon2 - lon1);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const cumulativeRouteDistances = (route: Coordinate[]) => {
  const distances = [0];
  for (let index = 1; index < route.length; index += 1) {
    distances.push(distances[index - 1] + segmentLengthKm(route[index - 1], route[index]));
  }
  return distances;
};

const pointAlongRoute = (route: Coordinate[], distances: number[], progress: number): Coordinate => {
  if (!route.length) return TWIN_PEAKS;
  if (route.length === 1 || progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const targetDistance = distances[distances.length - 1] * progress;
  let low = 1;
  let high = distances.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (distances[middle] < targetDistance) low = middle + 1;
    else high = middle;
  }
  const from = route[low - 1];
  const to = route[low];
  const segment = distances[low] - distances[low - 1];
  const amount = segment ? (targetDistance - distances[low - 1]) / segment : 0;
  return [from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount];
};

const bearingBetween = ([fromLon, fromLat]: Coordinate, [toLon, toLat]: Coordinate) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitude1 = radians(fromLat);
  const latitude2 = radians(toLat);
  const longitudeDelta = radians(toLon - fromLon);
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x = Math.cos(latitude1) * Math.sin(latitude2)
    - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const fitRouteView = (route: Coordinate[]): ViewState => {
  if (route.length < 2) {
    return { latitude: TWIN_PEAKS[1], longitude: TWIN_PEAKS[0], zoom: 13.8, bearing: 0, pitch: 38 };
  }
  const longitudes = route.map(([longitude]) => longitude);
  const latitudes = route.map(([, latitude]) => latitude);
  const longitudeSpan = Math.max(0.02, Math.max(...longitudes) - Math.min(...longitudes));
  const latitudeSpan = Math.max(0.02, Math.max(...latitudes) - Math.min(...latitudes));
  return {
    latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
    longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
    zoom: clamp(Math.min(Math.log2(360 / (longitudeSpan * 1.65)), Math.log2(170 / (latitudeSpan * 1.65))), 9.5, 12.5),
    bearing: 0,
    pitch: 22,
  };
};

const routeCamera = (route: Coordinate[], distances: number[], progress: number, showWholeRoute: boolean): ViewState => {
  if (showWholeRoute && route.length > 1) return fitRouteView(route);
  if (route.length < 2) {
    return { latitude: TWIN_PEAKS[1], longitude: TWIN_PEAKS[0], zoom: 14, bearing: 0, pitch: 42 };
  }

  const position = pointAlongRoute(route, distances, progress);
  const nextPosition = pointAlongRoute(route, distances, Math.min(1, progress + 0.012));
  const previousPosition = pointAlongRoute(route, distances, Math.max(0, progress - 0.012));
  const heading = progress >= 0.99 ? bearingBetween(previousPosition, position) : bearingBetween(position, nextPosition);
  return {
    longitude: position[0],
    latitude: position[1],
    zoom: progress < 0.035 || progress > 0.94 ? 14 : 13.65,
    bearing: heading,
    pitch: 48,
  };
};

const traceRoute = (route: Coordinate[], distances: number[], progress: number): Coordinate[] => {
  if (route.length < 2 || progress <= 0) return [];
  if (progress >= 1) return route;

  const targetDistance = distances[distances.length - 1] * progress;
  const traced = [route[0]];
  for (let index = 1; index < route.length; index += 1) {
    if (distances[index] >= targetDistance) {
      const from = route[index - 1];
      const to = route[index];
      const segment = distances[index] - distances[index - 1];
      const amount = segment ? (targetDistance - distances[index - 1]) / segment : 0;
      traced.push([from[0] + (to[0] - from[0]) * amount, from[1] + (to[1] - from[1]) * amount]);
      return traced;
    }
    traced.push(route[index]);
  }
  return traced;
};

const streetAtProgress = (steps: RoadStep[], progress: number, totalDistanceMeters: number) => {
  if (!steps.length) return 'Road names loading';
  const target = totalDistanceMeters * progress;
  let travelled = 0;
  for (const step of steps) {
    travelled += step.distance;
    if (travelled >= target && step.name) return step.name;
  }
  return [...steps].reverse().find((step) => step.name)?.name ?? 'Golden Gate Bridge';
};

const formatDistance = (meters: number) => {
  const miles = meters / 1609.344;
  return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
};

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeStatus, setRouteStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const storyRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      easing: SCROLL_EASING,
      smoothWheel: true,
      syncTouch: true,
      respectReducedMotion: true,
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadRoute = async () => {
      setRouteStatus('loading');
      try {
        const response = await fetch(ROUTE_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Route request failed');
        const result = await response.json();
        const route = result.routes?.[0];
        const coordinates = route?.geometry?.coordinates as Coordinate[] | undefined;
        if (result.code !== 'Ok' || !coordinates || coordinates.length < 2) {
          throw new Error('No road route found');
        }
        const steps: RoadStep[] = (route.legs ?? []).flatMap((leg: any) => leg.steps ?? []).map((step: any) => ({
          name: step.name ?? '',
          distance: Number(step.distance ?? 0),
        }));
        setRouteData({
          coordinates,
          distanceMeters: Number(route.distance ?? 0),
          durationSeconds: Number(route.duration ?? 0),
          steps,
        });
        setRouteStatus('ready');
      } catch {
        if (!controller.signal.aborted) setRouteStatus('unavailable');
      }
    };

    void loadRoute();
    return () => controller.abort();
  }, [retryCount]);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const cards = storyRef.current?.querySelectorAll<HTMLElement>('.chapter-card');
      if (!cards?.length) return;
      const first = cards[0].getBoundingClientRect();
      const last = cards[cards.length - 1].getBoundingClientRect();
      const firstCenter = first.top + first.height / 2;
      const lastCenter = last.top + last.height / 2;
      const readingPoint = window.innerHeight * (window.innerWidth <= 900 ? 0.7 : 0.52);
      const progress = lastCenter === firstCenter ? 0 : (readingPoint - firstCenter) / (lastCenter - firstCenter);
      setScrollProgress(clamp(progress, 0, 1));
    };
    const scheduleProgressUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    const unsubscribeLenis = lenisRef.current?.on('scroll', scheduleProgressUpdate);
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
    window.addEventListener('resize', scheduleProgressUpdate);
    return () => {
      unsubscribeLenis?.();
      window.removeEventListener('scroll', scheduleProgressUpdate);
      window.removeEventListener('resize', scheduleProgressUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const routeProgress = Math.min(1, scrollProgress / 0.8);
  const activeChapter = Math.min(chapters.length - 1, Math.round(scrollProgress * (chapters.length - 1)));
  const route = routeData?.coordinates ?? EMPTY_ROUTE;
  const routeDistances = useMemo(() => cumulativeRouteDistances(route), [route]);
  const tracedRoute = useMemo(() => traceRoute(route, routeDistances, routeProgress), [route, routeDistances, routeProgress]);
  const camera = routeCamera(route, routeDistances, routeProgress, scrollProgress > 0.91);
  const currentPosition = tracedRoute[tracedRoute.length - 1];

  const layers = useMemo(() => [
    new PathLayer({
      id: 'complete-road-route',
      data: route.length > 1 ? [{ path: route }] : [],
      getPath: (feature: { path: Coordinate[] }) => feature.path,
      getColor: [205, 220, 198, 100],
      getWidth: 3,
      widthUnits: 'pixels',
      widthMinPixels: 2,
      jointRounded: true,
      capRounded: true,
    }),
    new PathLayer({
      id: 'route-highlight-halo',
      data: tracedRoute.length > 1 ? [{ path: tracedRoute }] : [],
      getPath: (feature: { path: Coordinate[] }) => feature.path,
      getColor: [17, 22, 19, 235],
      getWidth: 9,
      widthUnits: 'pixels',
      widthMinPixels: 7,
      jointRounded: true,
      capRounded: true,
    }),
    new PathLayer({
      id: 'route-highlight',
      data: tracedRoute.length > 1 ? [{ path: tracedRoute }] : [],
      getPath: (feature: { path: Coordinate[] }) => feature.path,
      getColor: [207, 243, 105, 255],
      getWidth: 5,
      widthUnits: 'pixels',
      widthMinPixels: 4,
      jointRounded: true,
      capRounded: true,
    }),
  ], [route, tracedRoute]);

  const handleChapterClick = useCallback((index: number) => {
    const card = document.getElementById(`chapter-${index + 1}`);
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const isMobile = window.innerWidth <= 900;
    const stickyMapHeight = isMobile
      ? document.querySelector('.map-stage')?.getBoundingClientRect().height ?? 0
      : 0;
    const targetOffset = isMobile ? stickyMapHeight + 16 : (window.innerHeight - bounds.height) / 2;
    const target = Math.max(0, window.scrollY + bounds.top - targetOffset);

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 0.95, easing: SCROLL_EASING });
    } else {
      window.scrollTo({
        top: target,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.1, easing: SCROLL_EASING });
    } else {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
  }, []);

  const durationMinutes = routeData ? Math.max(1, Math.round(routeData.durationSeconds / 60)) : null;
  return (
    <main className="App">
      <section className="map-stage" aria-label="Animated road map from Twin Peaks to the Golden Gate Bridge">
        <MapCanvas viewport={camera}>
          <DeckOverlay layers={layers} />
          <Marker longitude={TWIN_PEAKS[0]} latitude={TWIN_PEAKS[1]} anchor="center">
            <div className="map-pin map-pin--start" aria-label="Start: Twin Peaks">
              <span className="map-pin__point" />
              <span className="map-pin__label"><small>START</small>Twin Peaks</span>
            </div>
          </Marker>
          <Marker longitude={GOLDEN_GATE[0]} latitude={GOLDEN_GATE[1]} anchor="center">
            <div className="map-pin map-pin--finish" aria-label="Finish: Golden Gate Bridge">
              <span className="map-pin__point" />
              <span className="map-pin__label"><small>FINISH</small>Golden Gate Bridge</span>
            </div>
          </Marker>
          {currentPosition && routeProgress > 0.005 && (
            <Marker longitude={currentPosition[0]} latitude={currentPosition[1]} anchor="center">
              <span className="map-traveler" aria-label="Current position along the route" />
            </Marker>
          )}
        </MapCanvas>

        <div className="map-stage__topline">
          <span className="map-stage__edition">FIELD STUDY <i>/</i> SAN FRANCISCO</span>
          <span className="map-stage__live"><span /> LIVE ROUTE</span>
        </div>

        <div className="map-stage__caption">
          <span className="map-stage__caption-label">ONE ROUTE / SIX MOMENTS</span>
          <strong>Twin Peaks <b>to</b> the Golden Gate</strong>
        </div>

        <div className="map-stage__progress" aria-live="polite">
          <div className="map-stage__progress-top">
            <span>{routeData ? `${formatDistance(routeData.distanceMeters)} · ${durationMinutes} MIN EST.` : 'ROAD ROUTE'}</span>
            <span>{String(activeChapter + 1).padStart(2, '0')} <i>/</i> {String(chapters.length).padStart(2, '0')}</span>
          </div>
          <div className="map-stage__progress-track"><span style={{ width: `${scrollProgress * 100}%` }} /></div>
          <div className="map-stage__progress-bottom">
            <span>{routeData ? streetAtProgress(routeData.steps, routeProgress, routeData.distanceMeters) : routeStatus === 'loading' ? 'Finding the mapped roads…' : 'Road route unavailable'}</span>
            <span>{Math.round(scrollProgress * 100)}%</span>
          </div>
        </div>
      </section>

      <section className="story-rail">
        <header className="story-header">
          <p className="kicker"><span /> INTERACTIVE FIELD STUDY / NO. 01</p>
          <h1>The city,<br /><em>in motion.</em></h1>
          <p className="intro">A road story from Twin Peaks to the Golden Gate. Keep your bearings as the map follows each turn.</p>

          <div className="route-summary">
            <div><span className="route-summary__label">FROM</span><strong>Twin Peaks</strong></div>
            <span className="route-summary__connector" aria-hidden="true"><i /><i /><i /></span>
            <div><span className="route-summary__label">TO</span><strong>Golden Gate Bridge</strong></div>
          </div>

          <div className="route-metrics" aria-label="Journey details">
            <div><strong>{routeData ? formatDistance(routeData.distanceMeters) : '--'}</strong><span>TOTAL DRIVE</span></div>
            <div><strong>{durationMinutes ?? '--'}<small> min</small></strong><span>EST. TIME</span></div>
            <div><strong>{String(chapters.length).padStart(2, '0')}</strong><span>CHAPTERS</span></div>
          </div>

          <div className={`route-status route-status--${routeStatus}`} aria-live="polite">
            <span className="route-status__dot" />
            <span>{routeStatus === 'ready'
              ? `Road route ready · ${formatDistance(routeData?.distanceMeters ?? 0)}`
              : routeStatus === 'loading' ? 'Loading the road route from OpenStreetMap…' : 'Road route did not load.'}</span>
            {routeStatus === 'unavailable' && <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>}
          </div>

          <button className="scroll-prompt" type="button" onClick={() => handleChapterClick(0)}>
            <span>FOLLOW THE ROAD</span>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v13M4.5 10.5 10 16l5.5-5.5" /></svg>
          </button>
        </header>

        <section className="story" ref={storyRef} aria-label="Journey chapters">
          {chapters.map((chapter, index) => {
            const sectionProgress = Math.min(1, index / (chapters.length - 2));
            const street = routeData ? streetAtProgress(routeData.steps, sectionProgress, routeData.distanceMeters) : null;
            return (
              <button
                id={`chapter-${index + 1}`}
                key={chapter.eyebrow}
                type="button"
                className={`chapter-card ${index === activeChapter ? 'is-active' : ''}`}
                onClick={() => handleChapterClick(index)}
                aria-current={index === activeChapter ? 'step' : undefined}
                aria-label={`${chapter.eyebrow}. ${chapter.title} Scroll to this chapter.`}
              >
                <span className="chapter-card__topline">
                  <span className="chapter-card__eyebrow">{chapter.eyebrow}</span>
                  <span className="chapter-card__number">{String(index + 1).padStart(2, '0')}</span>
                </span>
                <span className="chapter-card__title">{chapter.title}</span>
                <span className="chapter-card__copy">{chapter.copy}</span>
                <span className="chapter-card__footer">
                  <span className="chapter-card__street"><i /> {street ?? (routeStatus === 'loading' ? 'LOADING STREET DATA' : 'ROAD DATA UNAVAILABLE')}</span>
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>
                </span>
              </button>
            );
          })}
        </section>

        <footer className="story-footer">
          <div className="story-footer__principle">
            <span>THE DESIGN PRINCIPLE</span>
            <p>Keep the map in view.<br />Keep the next moment clear.</p>
          </div>
          <button className="story-footer__replay" type="button" onClick={handleReplay}>
            <span>REPLAY THE ROUTE</span>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 9a6 6 0 1 1 1.7 4.2M4 4v5h5" /></svg>
          </button>
          <div className="story-footer__credits">
            <span>ROUTE BY OSRM</span>
            <span>MAP DATA © OPENSTREETMAP CONTRIBUTORS</span>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default App;
