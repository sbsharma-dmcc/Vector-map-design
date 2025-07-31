import React, { useRef, useState, useEffect, useCallback, useContext, createContext } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import MapTopControls from './MapTopControls';
import DirectTokenInput from './DirectTokenInput';
import { getDTNToken } from '@/utils/dtnTokenManager';
import { createVesselMarkers, cleanupVesselMarkers } from '@/utils/vesselMarkers';
import { fourVessels, Vessel } from '@/lib/vessel-data';
import WeatherLayerConfig from './WeatherLayerConfig';


// =================================================================
// START: INLINE CSS FOR TOOLTIP
// =================================================================
const ThemedTooltipStyles = () => (
  <style>{`
    /* Reset the main popup container's default styles */
    .mapboxgl-popup-content {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    /* Style the API's container div with the user's requested styles */
    .dtn-tooltip-container {
      background: #1E293B;
      display: flex !important;
      max-width: 240px;
      padding: 8px !important;
      align-items: center;
      gap: 8px !important;
      border-radius: 5px !important;
      box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.16) !important;
      line-height: 1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      font-size: 14px;
    }

    /* Force the nested tables and rows to not take up space */
    .dtn-tooltip-table-multiple,
    .dtn-tooltip-table,
    .dtn-tooltip-table tbody,
    .dtn-tooltip-table tr {
      display: contents; /* This makes the containers "disappear" from the layout */
    }
    .dtn-tooltip-label {
      color: #FFFFFF;
    
    }
    /* Make the table cells flex items */
    .dtn-tooltip-table td {
        display: flex;
        align-items: baseline; /* Align text along the bottom */
        gap: 0.3em; /* Space between label, data, units */
    }

    /* Light Theme */
    .dtn-tooltip-light .dtn-tooltip-container {
      background: #FFFFFF !important;
      color: #1a202c !important;
    }
    .dtn-tooltip-light .mapboxgl-popup-tip {
      border-top-color: #FFFFFF !important;
    }
    .dtn-tooltip-light .dtn-tooltip-label {
      color: #718096 !important;
    }
    .dtn-tooltip-light .dtn-tooltip-data,
    .dtn-tooltip-light .dtn-tooltip-units {
      color: #1a202c !important;
      font-weight: 600;
    }

    /* Dark Theme */
    .dtn-tooltip-dark .dtn-tooltip-container {
      background: #1E293B !important; /* User requested color */
      color: #FFFFFF !important;
    }
    .dtn-tooltip-dark .mapboxgl-popup-tip {
      border-top-color: #1E293B !important;
    }
    .dtn-tooltip-dark .dtn-tooltip-label {
      color: #bdc3c7 !important;
    }
    .dtn-tooltip-dark .dtn-tooltip-data,
    .dtn-tooltip-dark .dtn-tooltip-units {
      color: #FFFFFF !important;
      font-weight: 600;
    }
  `}</style>
);
// =================================================================
// END: INLINE CSS FOR TOOLTIP
// =================================================================


// Helper function to load all your SVGs into the map
const loadWindBarbIcons = (map: mapboxgl.Map) => {
  const speeds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]; 
  
  speeds.forEach(speed => {
    const id = `wind-barb-${speed}`;
    const url = `/lovable-uploads/wind-barb-${speed}.svg`; 
    
    map.loadImage(url, (error, image) => {
      if (error) {
        console.error(`Failed to load wind barb icon: ${url}`, error);
        return;
      }
      if (image && !map.hasImage(id)) {
        map.addImage(id, image);
      }
    });
  });
};

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);



// Base layer styles for different themes
const baseLayerStyles = {
  light: 'mapbox://styles/geoserve/cmbhl6k77009w01r0hfa78uw7', // Your current light style
  dark: 'mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66', // Mapbox dark style
  default: 'mapbox://styles/geoserve/cmbhl6k77009w01r0hfa78uw7'
};

mapboxgl.accessToken = "pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q";

interface MapboxMapProps {
  vessels?: Record<string, unknown>[];
  accessToken?: string;
  showRoutes?: boolean;
  baseRoute?: [number, number][];
  weatherRoute?: [number, number][];
  activeRouteType?: 'base' | 'weather';
  activeLayers?: Record<string, boolean>;
  activeBaseLayer?: string;
  isGlobeViewEnabled?: boolean;
}

// Theme Toggle Button Component
const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="absolute top-5 right-16 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hover:shadow-xl transition-all duration-200"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="flex items-center space-x-2">
        {theme === 'light' ? (
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      </div>
    </button>
  );
};

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  vessels = [],
  accessToken,
  showRoutes = false,
  baseRoute = [],
  weatherRoute = [],
  activeRouteType = 'base',
  activeLayers = {},
  activeBaseLayer = 'default',
  isGlobeViewEnabled = false
}) => {
  const mapContainerRef = useRef(null);
  const mapref = useRef<mapboxgl.Map | null>(null);
  const vesselMarkersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  // =================================================================
  // START: TOOLTIP INTEGRATION - Step 1: Add ref for the tooltip
  // =================================================================
  const tooltipRef = useRef<mapboxgl.Popup | null>(null);
  // =================================================================
  // END: TOOLTIP INTEGRATION - Step 1
  // =================================================================

  const [showLayers, setShowLayers] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Load theme from localStorage or default to light
    const saved = localStorage.getItem('mapTheme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Theme toggle function
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('mapTheme', newTheme);
      return newTheme;
    });
  }, []);

  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const activeWeatherLayers = activeOverlays.filter(layer => 
    ['wind', 'swell', 'tropicalStorms', 'pressure', 'current', 'symbol', 'waves', 'significantWaveHeight', 'meanWaveDirection', 'currentSpeed', 'pressure-gradient'].includes(layer)
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapVessels, setMapVessels] = useState<Vessel[]>([]);
  
  // Load saved configurations from session storage
  useEffect(() => {
    const savedConfigs = sessionStorage.getItem('layerConfigs');
    if (savedConfigs) {
      try {
        setLayerConfigs(prev => ({ ...prev, ...JSON.parse(savedConfigs) }));
      } catch (error) {
        console.error('Error loading saved layer configs:', error);
      }
    }
  }, []);

  // Enhanced configuration state for each layer type
  const [layerConfigs, setLayerConfigs] = useState({
    wind: {
      textColor: '#ffffff',
      textSize: 16,
      textOpacity: 0.9,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 80,
      allowOverlap: true,
      barbStyle: 'full',
      speedUnit: 'knots'
    },
    currentSpeed: { // Add this entire block
      fillOpacity: 0.3,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0008,
      animationEnabled: true,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      gradient: [
        { value: '0.0kt', color: 'rgb(0, 0, 255)' },
        { value: '0.5kt', color: 'rgb(70, 130, 180)' },
        { value: '1.0kt', color: 'rgb(0, 255, 255)' },
        { value: '1.5kt', color: 'rgb(173, 255, 47)' },
        { value: '2.0kt', color: 'rgb(255, 255, 0)' },
        { value: '2.5kt', color: 'rgb(255, 165, 0)' },
        { value: '3.0kt', color: 'rgb(255, 69, 0)' },
        { value: '3.5kt', color: 'rgb(255, 0, 0)' },
        { value: '4.0kt', color: 'rgb(220, 20, 60)' },
        // { value: '4.0kt+', color: 'rgb(139, 0, 0)' }
      ]
    },
    windSpeedValues: {
      textColor: { light: '#1C4ED8', dark: '#B0CFF9' },
      textSize: 16,
      textOpacity: 0.5,
      haloColor: { light: '#1c4ed8', dark: '#B0CFF9' },
      haloWidth: 0.5,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→',
      showSizeValue: false
    },
    pressure: {
      contourWidth: 1,
      contourOpacity: 0.8,
      highPressureColor: '#ff0000',
      mediumPressureColor: '#80ff80',
      lowPressureColor: '#800080',
      heatmapRadius: 20,
      heatmapIntensity: 0.6,
      fillOpacity: 0.7
    },
    swell: {
      fillOpacity: 0.3,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0008,
      animationEnabled: true,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      gradient: [
        { value: '0m', color: '#072144' },
        { value: '0.5m', color: '#1926bd' },
        { value: '1m', color: '#0c5eaa' },
        { value: '1.5m', color: '#0d7bc2', },
        { value: '2m', color: '#16b6b3' },
        { value: '2.5m', color: '#15d5a5' },
        { value: '3m', color: '#10b153' },
        { value: '3.5m', color: '#82c510' },
        { value: '4m', color: '#d1d112' },
        { value: '4.5m', color: '#c5811e' },
        { value: '5m', color: '#c35215'},
        { value: '6m', color: '#B03f12' },
        { value: '7m', color: '#e05219' },
        { value: '8m', color: '#c6141c' },
        { value: '9m', color: '#8f0a10' },
        { value: '10m+', color: '#56001d' }
      ]
    },
    waves: {
      fillOpacity: 0.3,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0006,
      animationEnabled: false,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      gradient: [
        { value: '0m', color: '#072144' },
        { value: '0.5m', color: '#1926bd' },
        { value: '1m', color: '#0c5eaa' },
        { value: '1.5m', color: '#0d7bc2', },
        { value: '2m', color: '#16b6b3' },
        { value: '2.5m', color: '#15d5a5' },
        { value: '3m', color: '#10b153' },
        { value: '3.5m', color: '#82c510' },
        { value: '4m', color: '#d1d112' },
        { value: '4.5m', color: '#c5811e' },
        { value: '5m', color: '#c35215'},
        { value: '6m', color: '#B03f12' },
        { value: '7m', color: '#e05219' },
        { value: '8m', color: '#c6141c' },
        { value: '9m', color: '#8f0a10' },
        { value: '10m+', color: '#56001d' }
      ]
    },
    // === START: ADD THIS BLOCK FOR THE NEW LAYER'S STYLE ===
    significantWaveHeight: {
      fillOpacity: 0.4,
      fillOutlineColor: 'transparent',
      animationEnabled: false,
      gradient: [
        { value: '0m', color: '#072144' },
        { value: '0.5m', color: '#1926bd' },
        { value: '1m', color: '#0c5eaa' },
        { value: '1.5m', color: '#0d7bc2' },
        { value: '2m', color: '#16b6b3' },
        { value: '2.5m', color: '#15d5a5' },
        { value: '3m', color: '#10b153' },
        { value: '4m', color: '#d1d112' },
        { value: '5m', color: '#c35215' },
        { value: '6m', color: '#b03f12' },
        { value: '7m', color: '#e05219' },
        { value: '9m', color: '#c6141c' },
        { value: '11m', color: '#8f0a10' },
        { value: '14m+', color: '#56001d' }
      ]
    },
    meanWaveDirection: {
      textColor: { light: '#1c4ed8', dark: '#b0cff9' },
      textSize: 16,
      textOpacity: 0.5,
      haloColor: { light: '#1c4ed8', dark: '#b0cff9' },
      haloWidth: 1,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→',
      showSizeValue: false,
      writingMode: ['horizontal'] // ✅ ADD THIS
    },
    symbol: {
      textColor: '#ffffff',
      textSize: 16,
      textOpacity: 0.8,
      haloColor: '#ffffff',
      haloWidth: 0.5,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→',
      showSizeValue: false
    },
    current: {
      textColor: { light: '#1c4ed8', dark: '#b0cff9' },
      textSize: 16,
      textOpacity: 0.5,
      haloColor: { light: '#1c4ed8', dark: '#b0cff9' },
      haloWidth: 0.5,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→',
      showSizeValue: false
    }
  });

  const { toast } = useToast();

  const dtnOverlays = {
    symbol: { dtnLayerId: 'fcst-manta-wind-symbol-grid', tileSetId: 'dd44281e-db07-41a1-a329-bedc225bb575' },
    wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
    swell: { dtnLayerId: 'fcst-sea-wave-height-swell-waves-contours', tileSetId: 'ac650273-17fe-4a69-902f-7c1aeffc5e67' },
    pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-4mb-isolines', tileSetId: '340fb38d-bece-48b4-a23f-db51dc834992' },
    current: {dtnLayerId: 'fcst-manta-current-direction-grid', tileSetId: '670bca59-c4a0-491e-83bf-4423a3d84d6f'},
    waves:{ dtnLayerId :'fcst-sea-wave-height-wind-waves-contours', tileSetId:'7f9421ef-35f6-45a2-81fd-39bbf8cb0822'},
    tropicalStorms: { dtnLayerId: 'sevwx-dtn-tropical-cyclones-plot', tileSetId: '7601024c-f40c-44ec-8f69-c8a8c0dde980' },
    'pressure-gradient': { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-gradient', tileSetId: '3fca4d12-8e9a-4c15-9876-1a2b3c4d5e6f' },
    windSpeedValues: { dtnLayerId: 'fcst-manta-wind-speed-grid', tileSetId: '8801572e-b10c-4407-8581-3236ff8d2375' },
    significantWaveHeight: { dtnLayerId: 'fcst-manta-significant-wave-height-contours', tileSetId: 'b6c27807-162d-4570-9952-f692cde9109d' },
    meanWaveDirection: { dtnLayerId: 'fcst-manta-mean-wave-direction-grid', tileSetId: '771cdc60-c945-4545-a332-768c379ce563'},
    currentSpeed: { dtnLayerId: 'fcst-manta-current-speed-contours', tileSetId: 'd857dae9-ad80-4357-9201-f7a4d1f6363d' }, 
  };

  // Define a config object for tropical storms
  const tropicalStormConfig = {
    border: {
      cone: { color: '#FFFFFF', width: 4 },
      history: { color: '#FFFFFF', width: 3 },
      forecast: { color: '#FFFFFF', width: 1 }
    },
    lines: {
      cone: { color: '#000000', width: 2 },
      history: { color: '#000000', width: 1 },
      forecast: { color: '#000000', dasharray: [7,5] }
    },
    points: {
      color: '#BEBEBE',
      strokeWidth: 2,
      opacity: { default: 1, investigation: 0.6 },
      strokeColor: { default: '#000000', investigation: '#FFFFFF' },
      radiusZoomStops: [[0, 1.5], [6, 5]]
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapref.current) return; // initialize map only once

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: baseLayerStyles[theme] || baseLayerStyles.default,
      center: [0, 20],
      zoom: 2,
      attributionControl: false
    });

    mapref.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      setIsMapLoaded(true);
      console.log("Map fully loaded");
      
      // Restore the dummy layer required by weather overlays
      if (!map.getLayer('vessel-layer')) {
        map.addLayer({
          id: 'vessel-layer',
          type: 'symbol',
          source: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
        });
      }
      
      toast({
        title: "Map Loaded",
        description: "Map has been successfully initialized"
      });
    });

    map.on('error', (e) => {
      console.error("Map error:", e.error);
      toast({
        title: "Map Error",
        description: "Failed to load the map. Please check your internet connection.",
        variant: "destructive"
      });
    });

    return () => {
      if (mapref.current) {
        mapref.current.remove();
        mapref.current = null;
      }
      setIsMapLoaded(false);
    };
  }, []); // Remove theme dependency from initial setup

  // Handle theme changes - switch map style
  useEffect(() => {
    const map = mapref.current;
    if (!map || !isMapLoaded) return;

    console.log(`Switching map style to theme: ${theme}`);
    map.setStyle(baseLayerStyles[theme] || baseLayerStyles.default);

    // Re-apply overlays after style has changed
    map.once('styledata', () => {
      console.log("Re-applying active overlays after style change:", activeOverlays);
      
      // Re-add the vessel layer first
      if (!map.getLayer('vessel-layer')) {
        map.addLayer({
          id: 'vessel-layer',
          type: 'symbol',
          source: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
        });
      }
      
      // Use a temporary list to avoid race conditions with state updates
      const overlaysToReapply = [...activeOverlays];
      setActiveOverlays([]); // Clear state to allow re-adding
      setTimeout(() => {
        overlaysToReapply.forEach(overlay => handleOverlayClick(overlay, true));
      }, 100);
    });

  }, [theme, isMapLoaded]);

  // Handle globe view toggle
  useEffect(() => {
    if (!mapref.current) return;

    if (isGlobeViewEnabled) {
      mapref.current.setProjection('globe');
    } else {
      mapref.current.setProjection('mercator');
    }
  }, [isGlobeViewEnabled]);

  const handleVesselDrag = useCallback((vesselId: string, newPosition: [number, number]) => {
    setMapVessels(currentVessels =>
      currentVessels.map(v =>
        v.id === vesselId ? { ...v, position: newPosition } : v
      )
    );
  }, []);

  const markersCreatedOnceRef = useRef(false);

  // Load vessels from the predefined list
  useEffect(() => {
    setMapVessels(fourVessels);
  }, []);

  // Listen for configuration updates from sidebar
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      const { layerType, config } = event.detail;
      console.log('Received config update:', { layerType, config });
      setLayerConfigs(prev => ({
        ...prev,
        [layerType]: config
      }));
      applyLayerConfiguration(layerType, config);
    };

    window.addEventListener('weatherConfigUpdate', handleConfigUpdate as EventListener);
    return () => {
      window.removeEventListener('weatherConfigUpdate', handleConfigUpdate as EventListener);
    };
  }, []);

  // Manage vessel markers
  useEffect(() => {
    console.log('Vessel marker useEffect triggered.');
    if (!isMapLoaded || !mapref.current) {
      console.log('Map not loaded or mapref.current is null. Skipping vessel marker creation.');
      return;
    }

    if (markersCreatedOnceRef.current) {
      console.log('Vessel markers already created once. Skipping.');
      return;
    }

    console.log('Current mapVessels state:', mapVessels);

    // Cleanup old markers first (this will only run once now)
    cleanupVesselMarkers(mapref.current, vesselMarkersRef);

    // Create new markers
    if (mapVessels.length > 0) {
      console.log("Adding draggable vessels to map:", mapVessels.length);
      createVesselMarkers(mapref.current, mapVessels, vesselMarkersRef, handleVesselDrag);
      markersCreatedOnceRef.current = true; // Mark as created
    } else {
      console.log('No vessels in mapVessels array. Not creating markers.');
    }

  }, [isMapLoaded, mapVessels, handleVesselDrag]);

  useEffect(() => {
    if (!activeLayers || !isMapLoaded) return;

    Object.entries(activeLayers).forEach(([layerType, enabled]) => {
      if (enabled && layerType in dtnOverlays && !activeOverlays.includes(layerType)) {
        handleOverlayClick(layerType);
      } else if (!enabled && activeOverlays.includes(layerType)) {
        removeOverlay(layerType);
      }
    });
  }, [activeLayers, isMapLoaded]);

  
  // =================================================================
  // START: TOOLTIP INTEGRATION - Step 2: Add useEffect for tooltip logic
  // =================================================================
    useEffect(() => {
    const map = mapref.current;
    if (!map || !isMapLoaded) return;

    const handleMapClick = (e: mapboxgl.MapLayerMouseEvent) => {
      // Always remove the previous tooltip if it exists
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }

      // Step 1: Query for rendered features at the clicked point
      const features = map.queryRenderedFeatures(e.point);
      if (!features.length) {
        return; // Exit if no features were clicked
      }

      // Step 2: Grab the top-most feature
      const topFeature = features[0];
      
      // Step 3: Check if the feature has properties we can use to build a tooltip
      // We assume a 'value' property exists, as it's used in your layer styling.
      if (topFeature.properties && topFeature.properties.value !== undefined) {
        
        // Sanitize and format the data from the feature's properties
        const value = Number(topFeature.properties.value).toFixed(2);
        const layerId = topFeature.layer.id.replace('dtn-layer-', ''); // e.g., 'swell'
        const label = layerId.charAt(0).toUpperCase() + layerId.slice(1);
        const unit = topFeature.properties.unit || ''; // Use unit if available

        // Step 4: Build the tooltip HTML directly from the feature properties
        const tooltipHtml = `
          <div class="dtn-tooltip-container">
            <span class="dtn-tooltip-label">${label}:</span>
            <span class="dtn-tooltip-data">${value}</span>
            <span class="dtn-tooltip-units">${unit}</span>
          </div>
        `;

        // Step 5: Create the popup and add it to the map
        tooltipRef.current = new mapboxgl.Popup({ 
            closeButton: false,
            // Apply the theme class for correct dark/light styling
            className: `dtn-custom-tooltip dtn-tooltip-${theme}`
        })
          .setLngLat(e.lngLat)
          .setHTML(tooltipHtml)
          .addTo(map);

      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
    };
    // Re-run this effect if the map loads or the theme changes (to update popup style)
  }, [isMapLoaded, theme]);  // Dependencies for the effect
  // =================================================================
  // END: TOOLTIP INTEGRATION - Step 2
  // =================================================================
  

  const fetchDTNSourceLayer = async (layerId: string) => {
    try {
      const token = getDTNToken();
      console.log(`Fetching source layer for: ${layerId}`);
      
      const response = await fetch(`https://map.api.dtn.com/v2/styles/${layerId}`, {
        headers: {
          Authorization: token,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch source layer: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const sourceLayerName = data[0]?.mapBoxStyle?.layers?.[0]?.["source-layer"];
      console.log(`Source layer found: ${sourceLayerName}`);
      return sourceLayerName;
    } catch (error) {
      console.error('Error fetching DTN source layer:', error);
      throw error;
    }
  };

  // Enhanced layer update functions
  const updateLayerProperties = (layerType: string, properties: Record<string, any>) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (!mapref.current.getLayer(layerId)) return;

    Object.entries(properties).forEach(([property, value]) => {
      try {
        mapref.current!.setPaintProperty(layerId, property, value);
        console.log(`Updated ${layerType} ${property} to`, value);
      } catch (error) {
        console.warn(`Failed to update ${property}:`, error);
      }
    });
  };

  const updateLayoutProperties = (layerType: string, properties: Record<string, any>) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-${layerType}`;
    
    if (!mapref.current.getLayer(layerId)) return;

    Object.entries(properties).forEach(([property, value]) => {
      try {
        mapref.current!.setLayoutProperty(layerId, property, value);
        console.log(`Updated ${layerType} layout ${property} to`, value);
      } catch (error) {
        console.warn(`Failed to update layout ${property}:`, error);
      }
    });
  };

  // Add animation to swell layer
  const animateSwell = () => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;
    
    const layerId = `dtn-layer-swell`;
    
    if (mapref.current.getLayer(layerId)) {
      let offset = 0;
      
      const animate = () => {
        if (!mapref.current || !mapref.current.getLayer(layerId)) return;
        
        offset += layerConfigs.swell.animationSpeed;
        
        if (layerConfigs.swell.animationEnabled) {
          mapref.current.setPaintProperty(layerId, 'fill-translate', [
            Math.sin(offset * 2) * 2,
            Math.cos(offset) * 1
          ]);
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
      console.log('Started swell animation');
    }
  };

  const animateWindWaves = () => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    const layerId = `dtn-layer-waves`;

    if (mapref.current.getLayer(layerId)) {
      let offset = 0;

      const animate = () => {
        if (!mapref.current || !mapref.current.getLayer(layerId)) return;

        offset += layerConfigs.waves.animationSpeed;

        if (layerConfigs.waves.animationEnabled) {
          mapref.current.setPaintProperty(layerId, 'fill-translate', [
            Math.sin(offset * 2) * 2,
            Math.cos(offset) * 1
          ]);
        }

        requestAnimationFrame(animate);
      };

      animate();
      console.log('Started wind wave animation');
    }
  };

  // Utility to add two related layers (border + main) for a given type
  const addLinePair = (layerId: string, sourceId: string, sourceLayer: string, cfg: any, beforeId: string | undefined) => {
    mapref.current!.addLayer({
      id: `${layerId}-border`,
      type: "line",
      source: sourceId,
      "source-layer": sourceLayer,
      paint: {
        "line-color": cfg.border.color,
        "line-width": cfg.border.width
      },
      filter: cfg.filter
    }, beforeId);

    mapref.current!.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      "source-layer": sourceLayer,
      paint: {
        "line-color": cfg.line.color,
        "line-width": cfg.line.width,
        ...(cfg.line.dasharray ? { "line-dasharray": cfg.line.dasharray } : {})
      },
      filter: cfg.filter
    }, beforeId);
  };

  // Enhanced configuration application (moved before updateLayerConfig)
  const applyLayerConfiguration = (layerType: string, config: any) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    if (layerType === 'pressure') {
      updateLayerProperties(layerType, {
        'line-width': config.contourWidth || 1,
        'line-opacity': config.contourOpacity || 0.8,
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          980,
          config.lowPressureColor[theme],
          1000,
          config.lowPressureColor[theme],
          1013,
          config.mediumPressureColor[theme],
          1030,
          config.highPressureColor[theme],
          1050,
          config.highPressureColor[theme],
        ],
      });
    } else if (layerType === 'wind') {
      updateLayoutProperties(layerType, {
        'text-field': [
          'case',
          ['==', config.speedUnit || 'knots', 'mps'],
          ['concat', ['round', ['*', ['get', 'WIND_SPEED_MS'], 1]], 'm/s'],
          ['==', config.speedUnit || 'knots', 'kmh'],
          ['concat', ['round', ['*', ['get', 'WIND_SPEED_MS'], 3.6]], 'km/h'],
          ['concat', ['round', ['*', ['get', 'WIND_SPEED_MS'], 1.94384]], 'kt']
        ],
        'text-size': config.textSize || 16,
        'text-color': config.textColor[theme],
        'text-halo-color': config.haloColor[theme],
        'text-halo-width': config.haloWidth || 1,
        'text-allow-overlap': config.allowOverlap || true,
        'symbol-spacing': config.symbolSpacing || 80
      });

      updateLayerProperties(layerType, {
        'text-opacity': config.textOpacity || 0.9
      });
    } else if (layerType === 'swell') {
      updateLayerProperties(layerType, {
        'fill-opacity': config.fillOpacity || 0.9,
        'fill-outline-color': config.fillOutlineColor
      });

      if (config.gradient) {
        const colorExpression: any[] = [
          'interpolate',
          ['exponential', 1.5],
          ['to-number', ['get', 'value'], 0]
        ];
        config.gradient.forEach((item: any) => {
          const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
          colorExpression.push(heightValue, item.color);
        });
        updateLayerProperties(layerType, { 'fill-color': colorExpression });
      }

      if (config.animationEnabled) {
        animateSwell();
      }
    } else if (layerType === 'waves') {
      updateLayerProperties(layerType, {
        'fill-opacity': config.fillOpacity || 0.8,
        'fill-outline-color': config.fillOutlineColor
      });

      if (config.gradient) {
        const colorExpression: any[] = [
          'interpolate',
          ['exponential', 1.5],
          ['to-number', ['get', 'value'], 0]
        ];
        config.gradient.forEach((item: any) => {
          const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
          colorExpression.push(heightValue, item.color);
        });
        updateLayerProperties(layerType, { 'fill-color': colorExpression });
      }
    } else if (layerType === 'windSpeedValues') {
      // Fix is here: Use the 'config' parameter instead of hardcoded values.
      updateLayoutProperties(layerType, {
        "text-field": [
                'to-string',
                [
                  '/',
                  [
                    'round',
                    [
                      '*',
                      ['to-number', ['get', 'value']],
                      10
                    ]
                  ],
                  10
                ]
              ],
        'text-size': config.textSize,
        'text-font': ['Open Sans Regular'],
        'text-anchor': 'center',
        'text-allow-overlap': true
      });

      updateLayerProperties(layerType, {
        'text-color': config.textColor[theme],
        'text-opacity': config.textOpacity,
        'text-halo-color': config.haloColor[theme],
        'text-halo-width': config.haloWidth
      });
    }else if (layerType === 'meanWaveDirection') {
      updateLayoutProperties(layerType, {
        'text-field': getSymbolByType(config.symbolType || 'arrow', config.customSymbol),
        'text-size': config.textSize || 16,
        'text-rotation-alignment': config.rotationAlignment || 'map',
        'text-allow-overlap': config.allowOverlap ?? true,
        'symbol-spacing': config.symbolSpacing || 100,
        'text-writing-mode': ['horizontal'], // ✅ THIS IS CRUCIAL
        'text-rotate': ['get', 'value']
      });

      updateLayerProperties(layerType, {
        'text-color': config.textColor[theme] || '#FFFFFF',
        'text-opacity': config.textOpacity || 0.8,
        'text-halo-color': config.haloColor[theme] || '#000000',
        'text-halo-width': config.haloWidth || 1,
      });
    } else if (layerType === 'symbol') {
      // This block now only sets properties for icon-based symbols
      updateLayoutProperties(layerType, {
        'icon-image': config.iconImage,
        'icon-size': config.iconSize || 1,
        'icon-rotate': config.iconRotate || 0,
        'icon-rotation-alignment': config.rotationAlignment || 'map',
        'icon-allow-overlap': config.allowOverlap || true,
        'icon-ignore-placement': config.ignorePlacement || true,
      });

      updateLayerProperties(layerType, {
        'icon-opacity': config.iconOpacity || 1,
        'icon-halo-color': config.haloColor, // For glow effect around icon
        'icon-halo-width': config.haloWidth || 0,
      });
    } else if (layerType === 'currentSpeed') {
      updateLayerProperties(layerType, {
        'fill-opacity': config.fillOpacity || 0.3,
      });

      if (config.gradient) {
        const colorExpression: any[] = [
          'interpolate',
          ['linear'],
          ['to-number', ['get', 'value'], 0],
        ];
        
        // Replace the logic inside this forEach loop
        config.gradient.forEach((item: any) => {
          // Correctly parse the value by removing non-numeric parts first
          const speedValue = parseFloat(item.value.replace(/[^0-9.-]/g, ''));
          if (!isNaN(speedValue)) {
            colorExpression.push(speedValue, item.color);
          }
        });

        updateLayerProperties(layerType, { 'fill-color': colorExpression });
      }
    } else if (layerType === 'current') {
      updateLayoutProperties(layerType, {
        'text-field': getSymbolByType(config.symbolType || 'arrow', config.customSymbol),
        'text-size': config.textSize || 16,
        'text-rotation-alignment': config.rotationAlignment || 'map',
        'text-allow-overlap': config.allowOverlap || true,
        'symbol-spacing': config.symbolSpacing || 100,
      });

      updateLayerProperties(layerType, {
        'text-color': config.textColor[theme] || '#f9f9ff',
        'text-opacity': config.textOpacity || 0.8,
        'text-halo-color': config.haloColor[theme] || '#000000',
        'text-halo-width': config.haloWidth || 1,
      });
    } else if (layerType === 'tropicalStorms') {
      // Handle tropical storms configuration
      const opacity = config.opacity !== undefined ? config.opacity : 1;
      const showLabels = config.showLabels !== false;
      
      // Update all tropical storm related layers
      ['dtn-layer-tropicalStorms-cone', 'dtn-layer-tropicalStorms-track', 'dtn-layer-tropicalStorms-points'].forEach(layerId => {
        if (mapref.current?.getLayer(layerId)) {
          try {
            mapref.current.setPaintProperty(layerId, 'fill-opacity', opacity);
            mapref.current.setPaintProperty(layerId, 'line-opacity', opacity);
            mapref.current.setPaintProperty(layerId, 'circle-opacity', opacity);
          } catch (e) {
            // Layer might not support all properties
          }
        }
      });
    }
  };

  // Update layer configuration with session persistence
  const updateLayerConfig = (layerType: string, config: any) => {
    setLayerConfigs(prev => {
      const updated = { ...prev, [layerType]: { ...prev[layerType], ...config } };
      sessionStorage.setItem('layerConfigs', JSON.stringify(updated));
      return updated;
    });
    
    // Apply configuration immediately to active layers
    if (activeOverlays.includes(layerType)) {
      applyLayerConfiguration(layerType, { ...layerConfigs[layerType], ...config });
    }
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerType: string, visible: boolean) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    const layerIds = mapref.current.getStyle().layers
      ?.filter(layer => layer.id.includes(layerType))
      .map(layer => layer.id) || [];

    layerIds.forEach(layerId => {
      if (mapref.current?.getLayer(layerId)) {
        mapref.current.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    });

    // Update config to track visibility
    updateLayerConfig(layerType, { visible });
  };

  // Function to get symbol based on type
  const getSymbolByType = (symbolType: string, customSymbol?: string) => {
    switch (symbolType) {
      case 'arrow':
        return '→';
      case 'triangle':
        return '▲';
      case 'circle':
        return '●';
      case 'square':
        return '■';
      case 'custom':
        return customSymbol || '→';
      default:
        return '→';
    }
  };

  const handleOverlayClick = async (overlay: string, forceAdd = false) => {
    console.log(`Attempting to add overlay: ${overlay}`);
    
    if (!mapref.current || !mapref.current.isStyleLoaded()) {
      console.warn("Map style not yet loaded");
      toast({
        title: "Map Loading",
        description: "Please wait for the map to fully load before adding layers",
        variant: "destructive"
      });
      return;
    }

    // Add the new ECA logic right before the 'nautical' block:
    if (activeOverlays.includes(overlay) && !forceAdd) {
      console.log(`Removing overlay: ${overlay}`);
      removeOverlay(overlay);
      return;
    }

    // START: Add this block for ECA layer logic
    if (overlay === 'eca') {
      try {
        console.log("1. ECA block entered."); // <-- ADD THIS
    
        const apiUrl = 'https://vo.geoserves-test.com/api/conditional-areas/eca-regions';
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`ECA API request failed: ${response.status}`);
        
        const responseData = await response.json();
        console.log("2. API Response Data:", responseData); // <-- ADD THIS

        const ecaFeatures = responseData.data;

        const ecaGeoJSON = {
          type: 'FeatureCollection',
          features: ecaFeatures
        };
        console.log("3. GeoJSON object created:", ecaGeoJSON);
        const sourceId = 'eca-source';
        if (mapref.current && !mapref.current.getSource(sourceId)) {
          mapref.current.addSource(sourceId, {
            type: 'geojson',
            data: ecaGeoJSON
          });
        }

        const beforeId = 'vessel-layer';

        if (mapref.current && !mapref.current.getLayer('eca-fill-layer')) {
          mapref.current.addLayer({
            id: 'eca-fill-layer',
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': '#001E4C', // Dark blue fill
              'fill-opacity': 0.3
            }
          }, beforeId);
        }

        if (mapref.current && !mapref.current.getLayer('eca-outline-layer')) {
          mapref.current.addLayer({
            id: 'eca-outline-layer',
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#FEF9C3', // Light yellow outline
              'line-width': 1.5
            }
          }, beforeId);
        }
        
        setActiveOverlays(prev => [...prev, overlay]);
        toast({ title: "ECA Layer Added", description: "Emission Control Areas are now shown." });

      } catch (error) {
        console.error("Failed to add ECA layer:", error);
        toast({ title: "ECA Layer Error", description: "Could not load ECA data.", variant: "destructive" });
      }
      return; 
    }
    // END: Add this block


    if (overlay === 'nautical') {
      const sourceId = 'openseamap-source';
      const layerId = 'openseamap-layer';

      if (!mapref.current.getSource(sourceId)) {
        mapref.current.addSource(sourceId, {
          type: 'raster',
          tiles: [
            'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
          ],
          tileSize: 256
        });
      }

      if (!mapref.current.getLayer(layerId)) {
        const layers = mapref.current.getStyle().layers;
        const firstSymbolId = layers.find(l => l.type === 'symbol')?.id;

        mapref.current.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId,
          paint: {},
        }, firstSymbolId);
      }

      setActiveOverlays(prev => [...prev, overlay]);
      return;
    }

    const { dtnLayerId, tileSetId } = dtnOverlays[overlay];
    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;

    try {
      console.log(`Adding overlay details:`, { overlay, dtnLayerId, tileSetId, sourceId, layerId });
      
      const token = getDTNToken();
      const authToken = token.replace('Bearer ', '');
      
      const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
      
      const tileURL = `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${authToken}`;
      console.log(`Tile URL: ${tileURL}`);
      
      if (!mapref.current.getSource(sourceId)) {
        console.log(`Adding source: ${sourceId}`);
        mapref.current.addSource(sourceId, {
          type: "vector",
          tiles: [tileURL],
          minzoom: 0,
          maxzoom: 14,
        });

        const bottomLayers = ['swell', 'waves'];
        const isBottomLayer = bottomLayers.includes(overlay);

        let beforeId: string | undefined;

        if (isBottomLayer) {
          // This is a bottom layer. It should go below other weather layers.
          // Find the first non-bottom weather layer that is currently active.
          const firstTopWeatherLayer = activeOverlays.find(l => !bottomLayers.includes(l));
          
          if (firstTopWeatherLayer) {
            // If a top weather layer exists, add this new bottom layer before it.
            beforeId = `dtn-layer-${firstTopWeatherLayer}`;
          } else {
            // If no top weather layers exist, just add it before the vessel layer.
            beforeId = 'vessel-layer';
          }
        } else {
          // This is a "top" weather layer. It should always go just below the vessels.
          beforeId = 'vessel-layer';
        }

        if (overlay === 'pressure') {
          const config = layerConfigs.pressure;
          // Create pressure contour lines with configurable colors
          mapref.current.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "line-color": [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'value'], 1013],
                980, config.lowPressureColor,
                1000, config.lowPressureColor,
                1013, config.mediumPressureColor,
                1030, config.highPressureColor,
                1050, config.highPressureColor
              ],
              "line-width": [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, config.contourWidth,
                6, config.contourWidth * 1.5,
                10, config.contourWidth * 2,
                14, config.contourWidth * 3
              ],
              "line-opacity": config.contourOpacity
            },
            layout: {
              "visibility": "visible",
              "line-cap": "round",
              "line-join": "round"
            }
          }, beforeId);

        } else if (overlay === 'currentSpeed') {
          const config = layerConfigs.currentSpeed;
          const colorExpression: any[] = [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'value'], 0]
          ];

          config.gradient.forEach((item: any) => {
            // FIX: Clean the string value before parsing, just like in the update function
            const speedValue = parseFloat(item.value.replace(/[^0-9.-]/g, ''));
            if (!isNaN(speedValue)) {
              colorExpression.push(speedValue, item.color);
            }
          });

          mapref.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": colorExpression,
              "fill-opacity": config.fillOpacity,
              "fill-antialias": true
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);
        } else if (overlay === 'windSpeedValues') {
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": [
                'to-string',
                [
                  '/',
                  [
                    'round',
                    [
                      '*',
                      ['to-number', ['get', 'value']],
                      10
                    ]
                  ],
                  10
                ]
              ],
              "text-size": 12,
              "text-font": ["Open Sans Regular"],
              "text-anchor": "center",
              "text-allow-overlap": true
            },
            paint: {
              "text-color": layerConfigs.windSpeedValues.textColor[theme],
              "text-opacity": layerConfigs.windSpeedValues.textOpacity,
              "text-halo-color": layerConfigs.windSpeedValues.haloColor[theme],
              "text-halo-width": layerConfigs.windSpeedValues.haloWidth
            }
          }, beforeId);
        } else if (overlay === 'pressure-gradient') {
          // Create smooth pressure gradient using heatmap layer
          mapref.current.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "heatmap-color": [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(128, 0, 128, 0)',
                0.1, 'rgba(128, 0, 128, 0.2)',
                0.2, 'rgba(0, 0, 255, 0.3)',
                0.3, 'rgba(0, 128, 255, 0.4)',
                0.4, 'rgba(0, 255, 255, 0.5)',
                0.5, 'rgba(128, 255, 128, 0.4)',
                0.6, 'rgba(255, 255, 0, 0.5)',
                0.7, 'rgba(255, 128, 0, 0.6)',
                0.8, 'rgba(255, 0, 0, 0.7)',
                1, 'rgba(128, 0, 0, 0.8)'
              ],
              "heatmap-radius": [
                'interpolate',
                ['exponential', 2],
                ['zoom'],
                0, layerConfigs.pressure.heatmapRadius,
                6, layerConfigs.pressure.heatmapRadius * 2,
                10, layerConfigs.pressure.heatmapRadius * 4,
                14, layerConfigs.pressure.heatmapRadius * 6
              ],
              "heatmap-intensity": layerConfigs.pressure.heatmapIntensity,
              "heatmap-opacity": layerConfigs.pressure.fillOpacity
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);

        } else if (overlay === 'swell') {
          const colorExpression: any[] = [
            'interpolate',
            ['exponential', 1.5],
            ['to-number', ['get', 'value'], 0]
          ];

          layerConfigs.swell.gradient.forEach((item) => {
            const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
            colorExpression.push(heightValue, item.color);
          });

          mapref.current.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            "source-layer": sourceLayer,
            paint: {
              "fill-color": colorExpression,
              "fill-opacity": layerConfigs.swell.fillOpacity,
              "fill-outline-color": layerConfigs.swell.fillOutlineColor,
              "fill-antialias": true
            },
            layout: {
              "visibility": "visible"
            }
          }, beforeId);
          
          setTimeout(() => animateSwell(), 100);
        } else if (overlay === 'significantWaveHeight') {
            const config = layerConfigs.significantWaveHeight;
            const colorExpression: any[] = [
              'interpolate',
              ['exponential', 1.5],
              ['to-number', ['get', 'value'], 0]
            ];

            config.gradient.forEach((item) => {
              const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
              colorExpression.push(heightValue, item.color);
            });

            mapref.current.addLayer({
              id: layerId,
              type: "fill",
              source: sourceId,
              "source-layer": sourceLayer,
              paint: {
                "fill-color": colorExpression,
                "fill-opacity": config.fillOpacity,
                "fill-outline-color": config.fillOutlineColor,
                "fill-antialias": true
              },
              layout: {
                visibility: "visible"
              }
            }, beforeId); // 'beforeId' ensures it's placed correctly relative to other layers
        // === END: ADD THIS BLOCK TO DRAW THE NEW LAYER ===
// the lower wind we are not using
        } else if (overlay === 'wind') {
          mapref.current.addLayer({
            sprite: "https://map.api.dtn.com/static/sprite/wind-barbs",
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field":[
                "case",

                ["<", ["to-number", ["get", "value"]], 2.5], "○",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 2.5],
                  ["<", ["to-number", ["get", "value"]], 7.5]
                ], "│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 7.5],
                  ["<", ["to-number", ["get", "value"]], 12.5]
                ], "╸│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 12.5],
                  ["<", ["to-number", ["get", "value"]], 17.5]
                ], "━│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 17.5],
                  ["<", ["to-number", ["get", "value"]], 22.5]
                ], "━╸│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 22.5],
                  ["<", ["to-number", ["get", "value"]], 27.5]
                ], "━━│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 27.5],
                  ["<", ["to-number", ["get", "value"]], 32.5]
                ], "━━╸│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 32.5],
                  ["<", ["to-number", ["get", "value"]], 37.5]
                ], "━━━│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 37.5],
                  ["<", ["to-number", ["get", "value"]], 42.5]
                ], "━━━╸|",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 42.5],
                  ["<", ["to-number", ["get", "value"]], 47.5]
                ], "━━━━│",

                ["all",
                  [">=", ["to-number", ["get", "value"]], 47.5],
                  ["<", ["to-number", ["get", "value"]], 52.5]
                ], "━━━━╸│",

                "◤◤│" // default for anything ≥52.5
              ],
              "text-size": layerConfigs.wind.textSize,
              "text-rotation-alignment": "map",
              "text-rotate": [
                "case",
                ["has", "direction"],
                ["get", "direction"],
                ["has", "value1"], 
                ["get", "value1"],
                0
              ],
              "text-allow-overlap": layerConfigs.wind.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": layerConfigs.wind.symbolSpacing,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-anchor": "bottom"
            },
            paint: {
              "text-color": layerConfigs.wind.textColor,
              "text-opacity": layerConfigs.wind.textOpacity,
              "text-halo-color": layerConfigs.wind.haloColor,
              "text-halo-width": layerConfigs.wind.haloWidth
            },
          }, beforeId);
        } else if (overlay === 'waves') {
            const colorExpression: any[] = [
              'interpolate',
              ['exponential', 1.5],
              ['to-number', ['get', 'value'], 0]
            ];

            layerConfigs.waves.gradient.forEach((item) => {
              const heightValue = parseFloat(item.value.replace('m', '').replace('+', ''));
              colorExpression.push(heightValue, item.color);
            });

            mapref.current.addLayer({
              id: layerId,
              type: "fill",
              source: sourceId,
              "source-layer": sourceLayer,
              paint: {
                "fill-color": colorExpression,
                "fill-opacity": layerConfigs.waves.fillOpacity,
                "fill-outline-color": layerConfigs.waves.fillOutlineColor,
                "fill-antialias": layerConfigs.waves.fillAntialias
              },
              layout: {
                visibility: "visible"
              }
            }, beforeId);

            setTimeout(() => animateWindWaves(), 100);
          }else if (overlay === 'meanWaveDirection') {
            const symbolConfig = layerConfigs[overlay];
            const symbolText = getSymbolByType(symbolConfig.symbolType, symbolConfig.customSymbol);

            mapref.current.addLayer({
              id: layerId,
              type: "symbol",
              source: sourceId,
              "source-layer": sourceLayer,
              layout: {
                "text-field": symbolText,
                "text-size": symbolConfig.textSize || 16,
                "text-rotation-alignment": "map", // enforce alignment to map
                "text-writing-mode": ["horizontal"], // force consistent direction handling
                'text-rotate': ['get', 'value'],
                "text-allow-overlap": symbolConfig.allowOverlap,
                "text-ignore-placement": true,
                "symbol-spacing": symbolConfig.symbolSpacing || 100
              },
              paint: {
                "text-color": symbolConfig.textColor[theme],
                "text-opacity": symbolConfig.textOpacity || 0.8,
                "text-halo-color": symbolConfig.haloColor[theme],
                "text-halo-width": symbolConfig.haloWidth || 1
              },
            }, beforeId);
          }else if (overlay === 'symbol') {
    // Define keys for the layer and source
    const layerKey = 'symbol'; 
    const { dtnLayerId, tileSetId } = dtnOverlays[layerKey];
    const sourceId = `dtn-source-${layerKey}`;
    const layerId = `dtn-layer-${layerKey}`;
    
    try {
        const map = mapref.current;
        if (!map) return;

        // --- STEP 1: Set your custom style from Mapbox Studio ---
        const customMapboxStyleUrl = 'mapbox://styles/geoserve/cmcym02tg004g01sd6mg030ds';
        map.setStyle(customMapboxStyleUrl);

        // Wait for your custom style and its icons to load completely
        await new Promise(resolve => map.once('styledata', resolve));
        
        console.log("Available icons from your style:", map.listImages());

        // --- STEP 2: Add the DTN data source ---
        if (!map.getSource(sourceId)) {
            const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
            const token = getDTNToken();
            const authToken = token.replace('Bearer ', '');
            const tileURL = `https://map.api.dtn.com/v2/tiles/${dtnLayerId}/${tileSetId}/{z}/{x}/{y}.pbf?token=${authToken}`;
            map.addSource(sourceId, { type: "vector", tiles: [tileURL] });
        }

        // --- STEP 3: Add the layer using your 6 available icons ---
        if (!map.getLayer(layerId)) {
            const sourceLayer = await fetchDTNSourceLayer(dtnLayerId);
            map.addLayer({
                id: layerId,
                type: "symbol",
                source: sourceId,
                "source-layer": sourceLayer,
                layout: {
                    "icon-image": [
                        "case",
                        // Mapping wind speeds to your available icons
                        ["<", ["get", "windSpeedStyle"], 2.5], "dot-9",
                        ["<", ["get", "windSpeedStyle"], 7.5], "dot-10",
                        ["<", ["get", "windSpeedStyle"], 12.5], "dot-11",
                        ["<", ["get", "windSpeedStyle"], 17.5], "border-dot-13",
                        ["<", ["get", "windSpeedStyle"], 22.5], "wetland",
                        // Use 'cliff' as the fallback for all other speeds
                        "cliff"
                    ],
                    // This rotation logic should work as before
                    "icon-rotate": [
                        "case",
                        ["==", ["coalesce", ["get", "isNorthernHemisphereStyle"], ["get", "isNorth"]], true],
                        ["+", ["coalesce", ["get", "windDirectionStyle"], ["get", "value1"]], 90],
                        ["+", ["coalesce", ["get", "windDirectionStyle"], ["get", "value1"]], 270]
                    ],
                    "icon-size": 1.0, // You may need to adjust the size
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                },
            });
        }
        
        if (!activeOverlays.includes(overlay)) {
            setActiveOverlays(prev => [...prev, overlay]);
        }

    } catch (error) {
        console.error("Error adding custom symbol layer:", error);
    }
}else if (overlay === 'nautical'){
          console.log('Nautical charts');

        } else if (overlay === 'tropicalStorms') {
          const source = sourceId;
          const f = ["==", ["coalesce", ["get", "isUnderInvestigationStyle"], ["get", "isUnderInvestigation"]], false];

          addLinePair(`${layerId}-cone`, source, 'tropical_cyclone_consensus_cones', {
            border: tropicalStormConfig.border.cone,
            line: tropicalStormConfig.lines.cone,
            filter: f
          }, beforeId);

          addLinePair(`${layerId}-history`, source, 'tropical_cyclone_consensus_history_track', {
            border: tropicalStormConfig.border.history,
            line: tropicalStormConfig.lines.history,
            filter: f
          }, beforeId);

          addLinePair(`${layerId}-forecast`, source, 'tropical_cyclone_consensus_forecast_track', {
            border: tropicalStormConfig.border.forecast,
            line: tropicalStormConfig.lines.forecast,
            filter: f
          }, beforeId);

          // Points layer
          mapref.current.addLayer({
            id: `${layerId}-points`,
            type: "circle",
            source: source,
            "source-layer": "tropical_cyclone_consensus_points",
            paint: {
              "circle-color": tropicalStormConfig.points.color,
              "circle-stroke-width": tropicalStormConfig.points.strokeWidth,
              "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                tropicalStormConfig.points.radiusZoomStops[0][0], tropicalStormConfig.points.radiusZoomStops[0][1],
                tropicalStormConfig.points.radiusZoomStops[1][0], tropicalStormConfig.points.radiusZoomStops[1][1]
              ],
              "circle-stroke-opacity": [
                "case",
                ["==", ["coalesce", ["get", "positionTypeStyle"], ["get", "positionType"]], 1],
                0,
                tropicalStormConfig.points.opacity.investigation
              ],
              "circle-stroke-color": [
                "case",
                ["==", ["coalesce", ["get", "isUnderInvestigationStyle"], ["get", "isUnderInvestigation"]], false],
                tropicalStormConfig.points.strokeColor.default,
                tropicalStormConfig.points.strokeColor.investigation
              ],
              "circle-opacity": [
                "case",
                ["==", ["coalesce", ["get", "positionTypeStyle"], ["get", "positionType"]], 1],
                0,
                tropicalStormConfig.points.opacity.default
              ]
            },
            filter: f
          }, beforeId);
        } else if (overlay === 'current') {
            const symbolConfig = layerConfigs.current;
            const symbolText = getSymbolByType(symbolConfig.symbolType, symbolConfig.customSymbol);
            
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": symbolText,
              "text-size": symbolConfig.textSize,
              "text-rotation-alignment": symbolConfig.rotationAlignment,
              "text-rotate": [
                "case",
                ["has", "direction"],
                ["get", "direction"],
                ["has", "value1"], 
                ["get", "value1"],
                0
              ],
              "text-allow-overlap": symbolConfig.allowOverlap,
              "text-ignore-placement": true,
              "symbol-spacing": symbolConfig.symbolSpacing
            },
            paint: {
              "text-color": symbolConfig.textColor[theme],
              "text-opacity": symbolConfig.textOpacity,
              "text-halo-color": symbolConfig.haloColor[theme],
              "text-halo-width": symbolConfig.haloWidth
            },
          }, beforeId);
        }

        if (!activeOverlays.includes(overlay)) {
          setActiveOverlays(prev => [...prev, overlay]);
        }
        console.log(`Successfully added ${overlay} layer`);
        
        toast({
          title: `${overlay.charAt(0).toUpperCase() + overlay.slice(1)} Layer`,
          description: `Successfully loaded ${overlay} overlay`
        });
      } else {
        console.log(`Layer "${overlay}" already exists`);
        toast({
          title: "Layer Already Active",
          description: `${overlay} layer is already active on the map`
        });
      }
    } catch (error: any) {
      console.error(`Error adding ${overlay} layer:`, error);
      
      toast({
        title: "Layer Error",
        description: `Failed to add ${overlay} layer. Please check the token and try again.`,
        variant: "destructive"
      });
    }
  };

 // Add the new ECA removal logic at the top:
  const removeOverlay = (overlay: string) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

    // START: Add this block for ECA layer removal
    if (overlay === 'eca') {
      const sourceId = 'eca-source';
      const layerIds = ['eca-fill-layer', 'eca-outline-layer'];

      layerIds.forEach(id => {
        if (mapref.current && mapref.current.getLayer(id)) {
          mapref.current.removeLayer(id);
        }
      });

      if (mapref.current && mapref.current.getSource(sourceId)) {
        mapref.current.removeSource(sourceId);
      }
      
      setActiveOverlays(prev => prev.filter(item => item !== overlay));
      toast({ title: "ECA Layer Removed" });
      return;
    }
    // END: Add this block


    if (overlay === 'nautical') {
      const sourceId = 'openseamap-source';
      const layerId = 'openseamap-layer';

      if (mapref.current.getLayer(layerId)) {
        mapref.current.removeLayer(layerId);
      }
      if (mapref.current.getSource(sourceId)) {
        mapref.current.removeSource(sourceId);
      }

      setActiveOverlays(prev => prev.filter(item => item !== overlay));
      return;
    }

    const sourceId = `dtn-source-${overlay}`;
    const layerId = `dtn-layer-${overlay}`;
    const blurLayerId = `${layerId}-blur`;
    const fillLayerId = `${layerId}-fill`;

    // Remove tropical storms specific layers
    if (overlay === 'tropicalStorms') {
      const tropicalLayers = [
        `${layerId}-cone-border`,
        `${layerId}-cone`,
        `${layerId}-history-border`,
        `${layerId}-history`,
        `${layerId}-forecast-border`,
        `${layerId}-forecast`,
        `${layerId}-points`,
        `${layerId}-symbols`
      ];
      
      tropicalLayers.forEach(layer => {
        if (mapref.current!.getLayer(layer)) {
          mapref.current!.removeLayer(layer);
        }
      });
    } else {
      // Remove all related layers for other overlays
      if (mapref.current.getLayer(fillLayerId)) {
        mapref.current.removeLayer(fillLayerId);
      }
      if (mapref.current.getLayer(blurLayerId)) {
        mapref.current.removeLayer(blurLayerId);
      }
      if (mapref.current.getLayer(layerId)) {
        mapref.current.removeLayer(layerId);
      }
    }
    
    if (mapref.current.getSource(sourceId)) {
      mapref.current.removeSource(sourceId);
    }

    setActiveOverlays(prev => prev.filter(item => item !== overlay));
  };

  const removeAllOverlays = () => {
    activeOverlays.forEach(overlay => removeOverlay(overlay));
    setActiveOverlays([]);
    
    toast({
      title: "All Layers Removed",
      description: "All weather layers have been removed from the map"
    });
  };

  // Theme context provider value
  const themeContextValue = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemedTooltipStyles />
      <div className="relative h-full w-full">
        <MapTopControls />
        <DirectTokenInput />
        
        {/* Theme Toggle Button */}
        <ThemeToggleButton />
        
        <div ref={mapContainerRef} className="absolute inset-0" />
        <br></br>
        {/* Weather Layer Configuration Panel - Real-time on right side */}
        <WeatherLayerConfig 
          isOpen={activeWeatherLayers.length > 0}
          activeLayers={activeWeatherLayers}
        />

        {showLayers && (
          <div className="absolute top-32 left-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[200px]">
          {/* START: Add this block */}
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Regulatory & Chart Layers</h3>
            <div
              key="eca"
              onClick={() => handleOverlayClick('eca')}
              className={`p-2 my-1 rounded cursor-pointer transition-colors ${
                activeOverlays.includes('eca')
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
              }`}
            >
              ECA Zones
              {activeOverlays.includes('eca') && <span className="ml-2">✓</span>}
            </div>
            {/* END: Add this block */}
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">DTN Weather Layers</h3>
            {Object.keys(dtnOverlays).map((overlay) => (
              <div
                key={overlay}
                onClick={() => handleOverlayClick(overlay)}
                className={`p-2 m-1 rounded cursor-pointer transition-colors ${
                  activeOverlays.includes(overlay)
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                }`}
              >
                {overlay.charAt(0).toUpperCase() + overlay.slice(1).replace('-', ' ')}
                {activeOverlays.includes(overlay) && <span className="ml-2">✓</span>}
              </div>
            ))}
            {activeOverlays.length > 0 && (
              <button
                onClick={removeAllOverlays}
                className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Remove All Layers ({activeOverlays.length})
              </button>
            )}
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default MapboxMap;