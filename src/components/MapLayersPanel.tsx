/**
 * MAP LAYERS PANEL COMPONENT
 * 
 * This component provides a UI panel for managing map layers including:
 * - Weather overlay layers (wind, pressure, storm, current)
 * - Base layer styles (default, swell, wave)
 * - Globe view toggle
 * 
 * The panel communicates with the parent component through callbacks
 * to enable/disable layers and change base map styles.
 */

import React, { useState } from 'react';
import { X, Wind, Compass, Gauge, Type, Waves, Droplets, Map, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Maps from '@/pages/Maps';

// Props interface for layer panel control
interface MapLayersPanelProps {
  isOpen: boolean;                                        // Panel visibility state
  onClose: () => void;                                    // Close panel callback
  onLayerToggle: (layerType: string, enabled: boolean) => void; // Layer toggle callback
  activeLayer: string;                                    // Currently active base layer
  onBaseLayerChange: (layer: string) => void;             // Base layer change callback
  isGlobeViewEnabled: boolean;                            // Globe view state
  onGlobeViewToggle: (enabled: boolean) => void;          // Globe view toggle callback
}

const MapLayersPanel: React.FC<MapLayersPanelProps> = ({
  isOpen,
  onClose,
  onLayerToggle,
  activeLayer,
  onBaseLayerChange,
  isGlobeViewEnabled,
  onGlobeViewToggle
}) => {
  const [enabledLayers, setEnabledLayers] = useState<Record<string, boolean>>({
    wind: false,
    tropicalStorms: false,
    swell: false, // Add swell to enabled layers state
    waves: false,
    pressure: false,
    current: false,
    symbol: false
  });

  const [globeView, setGlobeView] = useState(false);

  const handleLayerToggle = (layerType: string) => {
    const newState = !enabledLayers[layerType];
    setEnabledLayers(prev => ({
      ...prev,
      [layerType]: newState
    }));
    onLayerToggle(layerType, newState);
  };

  const handleBaseLayerChange = (layerId: string) => {
    onBaseLayerChange(layerId);

    // Turn off both first
    if (enabledLayers.swell) handleLayerToggle('swell');
    if (enabledLayers.waves) handleLayerToggle('waves');

    // Then turn on selected one
    if (layerId === 'swell' && !enabledLayers.swell) {
      handleLayerToggle('swell');
    } else if (layerId === 'waves' && !enabledLayers.waves) {
      handleLayerToggle('waves');
    }
  };



  // Only wind layer active for testing
  const overlayLayers = [
    { id: 'wind', name: 'Wind', icon: Wind },
    { id: 'tropicalStorms', name: 'Tropical Storms', icon: () => <span className="text-xl">🌀</span> },
    { id: 'current', name: 'Current', icon: Compass },
    { id: 'symbol', name: 'Symbol', icon: Type },
    { id: 'pressure', name: 'Pressure', icon: Gauge },
    // { id: 'nautical', name: 'Nautical Charts', icon: MapPin},
    // { id: 'rasterWind', name: 'Raster Wind', icon: Wind}
  ];

  const baseLayers = [
    { id: 'default', name: 'Default', icon: Map },
    { id: 'swell', name: 'Swell', icon: Waves },
    { id: 'waves', name: 'Waves', icon: Droplets }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Overlays</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay Layers - Weather layers including tropical storms */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {overlayLayers.map((layer) => {
          const IconComponent = layer.icon;
          const isEnabled = enabledLayers[layer.id];
          
          return (
            <div key={layer.id} className="flex flex-col items-center">
              <button
                onClick={() => handleLayerToggle(layer.id)}
                className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                  isEnabled 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 text-blue-500 hover:bg-blue-200'
                }`}
              >
                <IconComponent className="h-8 w-8" />
              </button>
              <span className="text-sm font-medium">{layer.name}</span>
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Base Layer */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-3">Base layer</h4>
        <div className="grid grid-cols-3 gap-3">
          {baseLayers.map((layer) => {
            const IconComponent = layer.icon;
            return (
              <div key={layer.id} className="flex flex-col items-center">
                <button
                  onClick={() => handleBaseLayerChange(layer.id)}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                    activeLayer === layer.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-8 w-8" />
                </button>
                <span className="text-xs mt-1">{layer.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Globe View Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="globe-view"
          checked={isGlobeViewEnabled}
          onChange={(e) => onGlobeViewToggle(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="globe-view" className="ml-2 text-sm font-medium">
          Globe View
        </label>
      </div>
    </div>
  );
};

export default MapLayersPanel;