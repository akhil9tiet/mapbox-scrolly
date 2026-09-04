import { useEffect, useMemo, useRef, useState } from 'react';
import { ArcLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { DeckOverlay, GLOBE_SATELLITE_STYLE, MapCanvas } from './components/map';
import { ViewState } from './types';
import './App.css';

type Chapter = { eyebrow: string; title: string; copy: string; viewState: ViewState };
type Story = { id: string; label: string; title: string; chapters: Chapter[] };

const SFO: [number, number] = [-122.375, 37.621];
const BRIDGE: [number, number] = [-122.478, 37.819];
const DELHI: [number, number] = [77.209, 28.614];
const FALLBACK_ROAD_ROUTE: [number, number][] = [SFO, [-122.407, 37.64], [-122.419, 37.708], [-122.405, 37.775], [-122.445, 37.798], BRIDGE];
const routeLength = (route: [number, number][]) => route.slice(1).reduce((total, point, index) => {
  const previous = route[index];
  const latitudeDistance = (point[1] - previous[1]) * 111;
  const longitudeDistance = (point[0] - previous[0]) * 111 * Math.cos((previous[1] * Math.PI) / 180);
  return total + Math.sqrt(latitudeDistance ** 2 + longitudeDistance ** 2);
}, 0);

const normalizeLongitude = (longitude: number): number => {
  const normalized = ((longitude + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 ? 180 : normalized;
};

const createGreatCircleRoute = (from: [number, number], to: [number, number], steps: number): [number, number][] => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const toDegrees = (value: number) => (value * 180) / Math.PI;
  const fromLatitude = toRadians(from[1]);
  const fromLongitude = toRadians(from[0]);
  const toLatitude = toRadians(to[1]);
  const toLongitude = toRadians(to[0]);
  const fromVector = [Math.cos(fromLatitude) * Math.cos(fromLongitude), Math.cos(fromLatitude) * Math.sin(fromLongitude), Math.sin(fromLatitude)];
  const toVector = [Math.cos(toLatitude) * Math.cos(toLongitude), Math.cos(toLatitude) * Math.sin(toLongitude), Math.sin(toLatitude)];
  const angle = Math.acos(Math.min(1, Math.max(-1, fromVector[0] * toVector[0] + fromVector[1] * toVector[1] + fromVector[2] * toVector[2])));
  const points: [number, number][] = [];
  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const sine = Math.sin(angle);
    const firstWeight = sine === 0 ? 1 - progress : Math.sin((1 - progress) * angle) / sine;
    const secondWeight = sine === 0 ? progress : Math.sin(progress * angle) / sine;
    const x = firstWeight * fromVector[0] + secondWeight * toVector[0];
    const y = firstWeight * fromVector[1] + secondWeight * toVector[1];
    const z = firstWeight * fromVector[2] + secondWeight * toVector[2];
    let longitude = toDegrees(Math.atan2(y, x));
    if (points.length > 0) {
      const previousLongitude = points[points.length - 1][0];
      while (longitude - previousLongitude > 180) longitude -= 360;
      while (longitude - previousLongitude < -180) longitude += 360;
    }
    points.push([longitude, toDegrees(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)))]);
  }
  return points;
};

const FLIGHT_ROUTE = createGreatCircleRoute(SFO, DELHI, 96);

const traceRoute = (route: [number, number][], progress: number): [number, number][] => {
  if (progress <= 0 || route.length < 2) return [];
  if (progress >= 1) return route;
  const targetDistance = routeLength(route) * progress;
  let travelled = 0;
  const traced = [route[0]];
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    const latitudeDistance = (to[1] - from[1]) * 111;
    const longitudeDistance = (to[0] - from[0]) * 111 * Math.cos((from[1] * Math.PI) / 180);
    const segment = Math.sqrt(latitudeDistance ** 2 + longitudeDistance ** 2);
    if (travelled + segment >= targetDistance) {
      const fraction = (targetDistance - travelled) / segment;
      traced.push([from[0] + (to[0] - from[0]) * fraction, from[1] + (to[1] - from[1]) * fraction]);
      return traced;
    }
    traced.push(to);
    travelled += segment;
  }
  return traced;
};

const fitRouteView = (base: ViewState, route: [number, number][]): ViewState => {
  if (route.length < 2) return base;
  const longitudes = route.map(([longitude]) => longitude);
  const latitudes = route.map(([, latitude]) => latitude);
  const longitudeSpan = Math.max(0.02, Math.max(...longitudes) - Math.min(...longitudes));
  const latitudeSpan = Math.max(0.02, Math.max(...latitudes) - Math.min(...latitudes));
  const centerLongitude = normalizeLongitude((Math.max(...longitudes) + Math.min(...longitudes)) / 2);
  const centerLatitude = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
  const longitudeZoom = Math.log2(360 / (longitudeSpan * 1.65));
  const latitudeZoom = Math.log2(170 / (latitudeSpan * 1.65));
  return {
    ...base,
    latitude: centerLatitude,
    longitude: centerLongitude,
    zoom: Math.max(1.6, Math.min(12.5, Math.min(longitudeZoom, latitudeZoom))),
  };
};

const stories: Story[] = [
  { id: 'flight', label: 'FLIGHT / SF → DELHI', title: 'The long way east', chapters: [
    { eyebrow: '01 / DEPARTURE', title: 'San Francisco wakes up', copy: 'The route begins at the western edge of the continent, where the morning fog lifts off the bay.', viewState: { latitude: 37.621, longitude: -122.375, zoom: 10, bearing: 12, pitch: 44 } },
    { eyebrow: '02 / LIFT OFF', title: 'Out over the Pacific', copy: 'The camera pulls back as the coast falls away. The great-circle route starts to reveal itself.', viewState: { latitude: 38, longitude: -150, zoom: 2.8, bearing: 24, pitch: 38 } },
    { eyebrow: '03 / MIDPOINT', title: 'A blue hour between continents', copy: 'At cruising altitude, distance becomes the story. The arc bends with the shape of the earth.', viewState: { latitude: 42, longitude: -35, zoom: 2.6, bearing: 40, pitch: 34 } },
    { eyebrow: '04 / ARRIVAL', title: 'New Delhi, in the haze', copy: 'The route resolves over northern India, bringing the lens down to the city at the other end.', viewState: { latitude: 28.614, longitude: 77.209, zoom: 10, bearing: -15, pitch: 46 } },
    { eyebrow: '05 / THE WHOLE ARC', title: 'Distance, held in one frame', copy: 'Only now does the whole journey settle into view: one continuous line across oceans, borders, and time zones.', viewState: { latitude: 38, longitude: -18, zoom: 2.35, bearing: 18, pitch: 28 } },
  ] },
  { id: 'road', label: 'ROAD / SFO → GOLDEN GATE', title: 'One city, many thresholds', chapters: [
    { eyebrow: '01 / THE START', title: 'Leave the runway behind', copy: 'From the airport, the road traces the peninsula north. The city is still a thin line on the horizon.', viewState: { latitude: 37.653, longitude: -122.39, zoom: 11, bearing: 5, pitch: 42 } },
    { eyebrow: '02 / THE CROSSING', title: 'Through the city grid', copy: 'The route turns toward the bay, threading streets, hills, and the long view north.', viewState: { latitude: 37.75, longitude: -122.42, zoom: 11.2, bearing: 28, pitch: 48 } },
    { eyebrow: '03 / THE LANDMARK', title: 'Golden Gate, in full view', copy: 'A final pan brings the bridge il nto frame: a destination, and a threshold to what comes next.', viewState: { latitude: 37.805, longitude: -122.457, zoom: 12.2, bearing: 8, pitch: 52 } },
    { eyebrow: '04 / THE WHOLE ROAD', title: 'A route you can read', copy: 'The camera lifts just enough to show the complete drive, from the airport runway to the bridge span.', viewState: { latitude: 37.72, longitude: -122.425, zoom: 10.3, bearing: 0, pitch: 32 } },
  ] },
];

const lerpView = (from: ViewState, to: ViewState, amount: number): ViewState => ({ latitude: from.latitude + (to.latitude - from.latitude) * amount, longitude: from.longitude + (to.longitude - from.longitude) * amount, zoom: from.zoom + (to.zoom - from.zoom) * amount, bearing: from.bearing + (to.bearing - from.bearing) * amount, pitch: from.pitch + (to.pitch - from.pitch) * amount });

const flightCamera = (progress: number): ViewState => {
  const departure: ViewState = { latitude: 37.621, longitude: -122.375, zoom: 8.5, bearing: 0, pitch: 18 };
  const orbit: ViewState = { latitude: 24, longitude: -35, zoom: 1.55, bearing: 0, pitch: 0 };
  const arrival: ViewState = { latitude: 28.614, longitude: 77.209, zoom: 7.8, bearing: 0, pitch: 22 };
  if (progress < 0.18) {
    return lerpView(departure, orbit, progress / 0.18);
  }
  if (progress < 0.78) {
    const rotation = (progress - 0.18) / 0.6;
    return lerpView(orbit, { ...orbit, longitude: 42 }, rotation);
  }
  return lerpView({ ...orbit, longitude: 42 }, arrival, (progress - 0.78) / 0.22);
};

function App() {
  const [storyIndex, setStoryIndex] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [roadRoute, setRoadRoute] = useState<[number, number][]>(FALLBACK_ROAD_ROUTE);
  const storyRef = useRef<HTMLElement | null>(null);
  const story = stories[storyIndex];
  const segmentCount = Math.max(1, story.chapters.length - 1);
  const scaledProgress = scrollProgress * segmentCount;
  const chapterIndex = Math.min(segmentCount, Math.floor(scaledProgress));
  const localProgress = scaledProgress - chapterIndex;
  const routeProgress = scrollProgress;

  useEffect(() => {
    const loadRoadRoute = async () => {
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${SFO.join(',')};${BRIDGE.join(',')}?overview=full&geometries=geojson`);
        if (!response.ok) throw new Error('Road route request failed');
        const result = await response.json();
        const coordinates = result.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(coordinates) && coordinates.length > 1) {
          setRoadRoute(coordinates);
        }
      } catch {
        setRoadRoute(FALLBACK_ROAD_ROUTE);
      }
    };
    loadRoadRoute();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateTimeline = () => {
      frame = 0;
      const element = storyRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - window.innerHeight * 0.45);
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.45 - bounds.top) / travel));
      setScrollProgress(progress);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateTimeline);
    };
    updateTimeline();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [storyIndex]);

  const tracedRoad = useMemo(() => traceRoute(roadRoute, routeProgress), [roadRoute, routeProgress]);

  const tracedFlight = useMemo(() => {
    return traceRoute(FLIGHT_ROUTE, routeProgress);
  }, [routeProgress]);

  const chapterCamera = lerpView(
    story.chapters[chapterIndex].viewState,
    story.chapters[Math.min(segmentCount, chapterIndex + 1)].viewState,
    localProgress
  );
  const camera = fitRouteView(
    chapterCamera,
    storyIndex === 0 ? [] : tracedRoad
  );
  const displayedCamera = storyIndex === 0 ? flightCamera(routeProgress) : camera;

  const layers = useMemo(() => {
    const aircraftPosition = tracedFlight.length > 0
      ? [normalizeLongitude(tracedFlight[tracedFlight.length - 1][0]), tracedFlight[tracedFlight.length - 1][1]] as [number, number]
      : null;
    return [
    new ArcLayer({ id: 'flight-arc', data: storyIndex === 0 && aircraftPosition ? [{ source: SFO, target: aircraftPosition }] : [], getSourcePosition: (d: any) => d.source, getTargetPosition: (d: any) => d.target, getSourceColor: [255, 188, 92, 240], getTargetColor: [255, 91, 111, 240], getWidth: 5, getHeight: 0.45, greatCircle: true }),
    new PathLayer({ id: 'road-route', data: storyIndex === 1 ? [{ path: tracedRoad }] : [], getPath: (d: any) => d.path, getColor: [255, 91, 111, 240], getWidth: 5, widthMinPixels: 3, jointRounded: true, capRounded: true }),
    new ScatterplotLayer({ id: 'story-points', data: storyIndex === 1 ? [{ position: SFO }, { position: BRIDGE }] : [{ position: SFO }, { position: DELHI }], getPosition: (d: any) => d.position, getFillColor: [255, 188, 92, 245], getRadius: 3500, radiusMinPixels: 6, radiusMaxPixels: 15 }),
    ];
  }, [storyIndex, tracedFlight, tracedRoad]);

  return <main className="App">
    <section className="map-stage"><MapCanvas viewport={displayedCamera} mapStyle={storyIndex === 0 ? GLOBE_SATELLITE_STYLE : undefined}><DeckOverlay layers={layers} /></MapCanvas><div className="map-stage__label"><span className="live-dot" /> LIVE CARTOGRAPHY</div><div className="map-stage__coordinates">{displayedCamera.latitude.toFixed(2)}° / {displayedCamera.longitude.toFixed(2)}°</div></section>
    <section className="story-rail"><header className="story-header"><p className="kicker">MAPBOX SCROLLY / 2026</p><h1>Routes are stories<br /><em>in motion.</em></h1><p className="intro">Scroll to move through two visual essays about distance, cities, and the spaces between them.</p><nav className="story-tabs" aria-label="Choose a story">{stories.map((item, index) => <button key={item.id} className={index === storyIndex ? 'is-active' : ''} onClick={() => { setStoryIndex(index); setScrollProgress(0); }}>{item.label}</button>)}</nav></header><section className="story" ref={storyRef} data-story={story.id}><div className="story__title"><span>0{storyIndex + 1}</span><h2>{story.title}</h2></div>{story.chapters.map((item, index) => <article key={item.title} className={`chapter ${index === chapterIndex ? 'is-active' : ''}`}><p className="chapter__eyebrow">{item.eyebrow}</p><h3>{item.title}</h3><p>{item.copy}</p></article>)}</section><footer className="story-footer">SCROLL / EXPLORE / REPEAT</footer></section>
  </main>;
}

export default App;