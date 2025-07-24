import React, { useRef, useState, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';
import MapTopControls from './MapTopControls';
import DirectTokenInput from './DirectTokenInput';
import { getDTNToken } from '@/utils/dtnTokenManager';
import { createVesselMarkers, cleanupVesselMarkers } from '@/utils/vesselMarkers';
import { fourVessels, Vessel } from '@/lib/vessel-data';

import WeatherLayerConfig from './WeatherLayerConfig';

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
  const [showLayers, setShowLayers] = useState(false);
  
  
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const activeWeatherLayers = activeOverlays.filter(layer => ['wind', 'swell', 'tropicalStorms', 'pressure', 'current', 'symbol', 'waves'].includes(layer));
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

    symbol: {
      textColor: '#ff0000',
      textSize: 16,
      textOpacity: 0.8,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 100,
      allowOverlap: true,
      rotationAlignment: 'map',
      symbolType: 'arrow',
      customSymbol: '→',
      showSizeValue: false
    },
    current: {
      textColor: '#f9f9ff',
      textSize: 16,
      textOpacity: 0.8,
      haloColor: '#000000',
      haloWidth: 1,
      symbolSpacing: 100, // 🔄 FIXED: should be `symbolSpacing`, not `currentSpacing`
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
    'pressure-gradient': { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-gradient', tileSetId: '3fca4d12-8e9a-4c15-9876-1a2b3c4d5e6f' }
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

  // Initialize map
  useEffect(() => {
    if (mapref.current) return; // initialize map only once

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7',
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
  }, [toast]);

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

    const layerId = `dtn-layer-windwave`;

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
          config.lowPressureColor,
          1000,
          config.lowPressureColor,
          1013,
          config.mediumPressureColor,
          1030,
          config.highPressureColor,
          1050,
          config.highPressureColor,
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
        'text-color': config.textColor || '#ffffff',
        'text-halo-color': config.haloColor || '#000000',
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
        'fill-outline-color': config.fillOutlineColor || 'transparent'
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
        'fill-outline-color': config.fillOutlineColor || 'transparent'
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
    } else if (layerType === 'symbol') {
      updateLayoutProperties(layerType, {
        'text-field': getSymbolByType(config.symbolType || 'arrow', config.customSymbol),
        'text-size': config.textSize || 16,
        'text-rotation-alignment': config.rotationAlignment || 'map',
        'text-allow-overlap': config.allowOverlap || true,
        'symbol-spacing': config.symbolSpacing || 100,
      });

      updateLayerProperties(layerType, {
        'text-color': config.textColor || '#ff0000',
        'text-opacity': config.textOpacity || 0.8,
        'text-halo-color': config.haloColor || '#000000',
        'text-halo-width': config.haloWidth || 1,
      });
    } else if (layerType === 'current') {
      updateLayoutProperties(layerType, {
        'text-field': getSymbolByType(config.symbolType || 'arrow', config.customSymbol),
        'text-size': config.textSize || 16,
        'text-rotation-alignment': config.rotationAlignment || 'map',
        'text-allow-overlap': config.allowOverlap || true,
        'symbol-spacing': config.symbolSpacing || 100,
      });

      updateLayerProperties(layerType, {
        'text-color': config.textColor || '#f9f9ff',
        'text-opacity': config.textOpacity || 0.8,
        'text-halo-color': config.haloColor || '#000000',
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

  const handleOverlayClick = async (overlay: string) => {
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

    if (activeOverlays.includes(overlay)) {
      console.log(`Removing overlay: ${overlay}`);
      removeOverlay(overlay);
      return;
    }

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
        } else if (overlay === 'wind') {
          mapref.current.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            "source-layer": sourceLayer,
            layout: {
              "text-field": [
                "case",
                ["<", ["to-number", ["get", "value"], 0], 3], "○",
                ["<", ["to-number", ["get", "value"], 0], 8], "│",
                ["<", ["to-number", ["get", "value"], 0], 13], "╸│",
                ["<", ["to-number", ["get", "value"], 0], 18], "━│",
                ["<", ["to-number", ["get", "value"], 0], 23], "━╸│",
                ["<", ["to-number", ["get", "value"], 0], 28], "━━│",
                ["<", ["to-number", ["get", "value"], 0], 33], "━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 38], "━━━│",
                ["<", ["to-number", ["get", "value"], 0], 43], "━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 48], "━━━━│",
                ["<", ["to-number", ["get", "value"], 0], 53], "━━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 63], "◤│",
                ["<", ["to-number", ["get", "value"], 0], 68], "◤╸│",
                ["<", ["to-number", ["get", "value"], 0], 73], "◤━│",
                ["<", ["to-number", ["get", "value"], 0], 78], "◤━╸│",
                ["<", ["to-number", ["get", "value"], 0], 83], "◤━━│",
                ["<", ["to-number", ["get", "value"], 0], 88], "◤━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 93], "◤━━━│",
                ["<", ["to-number", ["get", "value"], 0], 98], "◤━━━╸│",
                ["<", ["to-number", ["get", "value"], 0], 103], "◤━━━━│",
                "◤◤│"
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
          } else if (overlay === 'symbol') {
          const symbolConfig = layerConfigs.symbol;
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
          }, beforeId);
        } else if (overlay === 'nautical'){
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
          }, beforeId);
        }

        setActiveOverlays(prev => [...prev, overlay]);
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

  const removeOverlay = (overlay: string) => {
    if (!mapref.current || !mapref.current.isStyleLoaded()) return;

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
        if (mapref.current.getLayer(layer)) {
          mapref.current.removeLayer(layer);
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
        if (mapref.current.getLayer(layer)) {
          mapref.current.removeLayer(layer);
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

  return (
    <div className="relative h-full w-full">
      <MapTopControls />
      <DirectTokenInput />
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Weather Layer Configuration Panel - Real-time on right side */}
      <WeatherLayerConfig 
        isOpen={activeWeatherLayers.length > 0}
        activeLayers={activeWeatherLayers}
      />

      

      {showLayers && (
        <div className="absolute top-32 left-4 z-20 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <h3 className="text-sm font-semibold mb-3">DTN Weather Layers</h3>
          {Object.keys(dtnOverlays).map((overlay) => (
            <div
              key={overlay}
              onClick={() => handleOverlayClick(overlay)}
              className={`p-2 m-1 rounded cursor-pointer transition-colors ${
                activeOverlays.includes(overlay)
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
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
  );
};

export default MapboxMap;
