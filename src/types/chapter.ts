import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon,
  Position,
} from 'geojson';
import type { ViewState } from './map';

export type RgbaColor = [red: number, green: number, blue: number, alpha: number];

export interface Pathsytle {
  color?: RgbaColor;
  width?: number;
  opacity?: number;
  widthMinPixels?: number;
  widthMaxPixels?: number;
}

export type PathStyle = Pathsytle;

export interface StoryCategoryEntry {
  id: string;
  title: string;
  description?: string;
  color?: RgbaColor;
}

export interface StoryCatalogInterface {
  id: string;
  title: string;
  description?: string;
  category?: string;
  chapters: Chapter[];
}

export interface StoryAssets {
  mapStyleUrl?: string;
  images?: Record<string, string>;
  videos?: Record<string, string>;
  data?: Record<string, string>;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  body?: string;
  viewState?: ViewState;
  assets?: StoryAssets;
  pathStyle?: PathStyle;
  layers?: string[];
  highlightIds?: string[];
}

export interface StoryManifest {
  version: string;
  stories: StoryCatalogInterface[];
  categories?: StoryCategoryEntry[];
  assets?: StoryAssets;
}

export type PathFeature = Feature<LineString>;
export type PointCollection = FeatureCollection<Point>;
export type PolygonCollection = FeatureCollection<Polygon>;

export type PathCoordinates = Position[];
