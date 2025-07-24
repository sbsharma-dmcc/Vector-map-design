
/**
 * MAP INITIALIZATION AND LAYER MANAGEMENT
 * 
 * This file handles the core map initialization and layer management including:
 * - Setting up the Mapbox map instance with proper configuration
 * - Adding bathymetry depth contours for marine navigation
 * - Managing terrain layers and fallback visualizations
 * - Handling map controls and interaction settings
 */

import mapboxgl from 'mapbox-gl';
import { baseLayerStyles, bathymetryContours } from './mapConstants';

// MAIN MAP INITIALIZATION FUNCTION
// Creates and configures a new Mapbox map instance
export const initializeMap = (
  container: HTMLDivElement,          // DOM container for the map
  token: string,                      // Mapbox access token
  showRoutes: boolean,                // Whether to show route visualization
  baseRoute: [number, number][]       // Route coordinates for centering
): mapboxgl.Map => {
  console.log("Setting mapbox access token");
  mapboxgl.accessToken = token;
  
  // MAP CONFIGURATION - Calculate center and zoom based on route data
  const mapOptions: mapboxgl.MapboxOptions = {
    container,
    style: 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7', // Custom marine style
    center: showRoutes && baseRoute.length > 0 
      ? [(baseRoute[0][0] + baseRoute[baseRoute.length - 1][0]) / 2,    // Center between start and end
         (baseRoute[0][1] + baseRoute[baseRoute.length - 1][1]) / 2] 
      : [83.167, 6.887],                                               // Default center (Indian Ocean)
    zoom: showRoutes ? 5 : 4,                                          // Closer zoom for routes
    attributionControl: false                                          // Hide default attribution
  };

  console.log("Creating map with options:", mapOptions);
  const map = new mapboxgl.Map(mapOptions);

  // MAP CONTROLS - Add navigation and interaction controls
  map.addControl(
    new mapboxgl.NavigationControl(),   // Zoom and rotation controls
    'bottom-right'                      // Position in bottom-right corner
  );

  // Enable zoom controls for user interaction
  map.scrollZoom.enable();

  // LAYER INITIALIZATION - Add depth contours when map finishes loading
  map.on('load', () => {
    addBathymetryContours(map);         // Add underwater terrain visualization
    map.addSource('openseamap', {
      type: 'raster',
      tiles: [
        'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    });

    map.addLayer({
      id: 'openseamap-layer',
      type: 'raster',
      source: 'openseamap',
      paint: {}
    });
  });

  return map;
};

export const addBathymetryContours = (map: mapboxgl.Map) => {
  try {
    // Add bathymetry data source
    map.addSource('bathymetry-contours', {
      'type': 'vector',
      'url': 'mapbox://mapbox.mapbox-bathymetry-v2'
    });

    // Add contour lines for each depth
    bathymetryContours.depths.forEach((depth, index) => {
      const layerId = `bathymetry-${depth}m`;
      
      const layers = map.getStyle().layers;
      const topLayer = layers.find(layer => layer.type === 'symbol' && layer.id.includes('label'));

      map.addLayer({
        'id': layerId,
        'type': 'line',
        'source': 'bathymetry-contours',
        'source-layer': 'depth',
        'filter': ['==', ['get', 'DEPTH'], -depth],
        'paint': {
          'line-color': bathymetryContours.colors[depth],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, depth === 0 ? 2 : 1,
            8, depth === 0 ? 3 : 1.5,
            12, depth === 0 ? 4 : 2
          ],
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 0.6,
            8, 0.8,
            12, 1
          ]
        },
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        }
      }, topLayer ? topLayer.id : undefined);

      // Add depth labels
      map.addLayer({
        'id': `${layerId}-labels`,
        'type': 'symbol',
        'source': 'bathymetry-contours',
        'source-layer': 'depth',
        'filter': ['==', ['get', 'DEPTH'], -depth],
        'layout': {
          'text-field': `${depth}m`,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, 10,
            12, 14
          ],
          'text-anchor': 'center',
          'symbol-placement': 'line',
          'text-rotation-alignment': 'map'
        },
        'paint': {
          'text-color': bathymetryContours.colors[depth],
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
          'text-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, 0.6,
            10, 1
          ]
        }
      });
    });

    console.log("Bathymetry contours added successfully");
  } catch (error) {
    console.error("Error adding bathymetry contours:", error);
    
    // Fallback: Add simple depth indicators using available data
    addFallbackDepthIndicators(map);
  }
};

const addFallbackDepthIndicators = (map: mapboxgl.Map) => {
  try {
    // Add a simple bathymetry visualization using mapbox terrain data
    map.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 14
    });

    // Add depth visualization layer
    map.addLayer({
      'id': 'depth-visualization',
      'type': 'hillshade',
      'source': 'mapbox-dem',
      'paint': {
        'hillshade-shadow-color': '#2563eb',
        'hillshade-highlight-color': '#93c5fd',
        'hillshade-accent-color': '#1d4ed8',
        'hillshade-exaggeration': 0.5,
        'hillshade-illumination-direction': 315,
        'hillshade-illumination-anchor': 'viewport'
      }
    });

    console.log("Fallback depth indicators added");
  } catch (error) {
    console.error("Error adding fallback depth indicators:", error);
  }
};

export const addTerrainLayer = (map: mapboxgl.Map) => {
  try {
    // Add vector tile source for terrain/elevation data instead of raster
    map.addSource('mapbox-dem-vector', {
      'type': 'vector',
      'url': 'mapbox://mapbox.mapbox-terrain-v2',
      'maxzoom': 14
    });

    // Add terrain layer using vector tiles
    map.addLayer({
      'id': 'terrain-layer',
      'type': 'fill-extrusion',
      'source': 'mapbox-dem-vector',
      'source-layer': 'contour',
      'paint': {
        'fill-extrusion-color': [
          'interpolate',
          ['linear'],
          ['get', 'ele'],
          0, '#4264fb',
          100, '#4fb3d9',
          500, '#85C1E5',
          1000, '#B8DBF0'
        ],
        'fill-extrusion-height': ['*', ['get', 'ele'], 10],
        'fill-extrusion-opacity': 0.3
      }
    });
  } catch (error) {
    console.error("Error adding terrain layer:", error);
  }
};
