import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_LAYER_CONFIGS: LayerConfigs = {
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
  windSpeedValues: {
    textColor: '#000000',
    textSize: 16,
    textOpacity: 0.9,
    haloColor: '#000000',
    haloWidth: 1
  },

  pressure: {
    contourWidth: 1,
    contourOpacity: 0.8,
    highPressureColor: '#ff0000',
    mediumPressureColor: '#80ff80',
    lowPressureColor: '#800080'
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
  symbol: {
    textColor: '#ffffff',
    textSize: 16,
    textOpacity: 0.8,
    haloColor: '#ffffff',
    haloWidth: 1,
    symbolSpacing: 100,
    allowOverlap: true,
    rotationAlignment: 'map',
    symbolType: 'arrow',
    customSymbol: '→'
  },
  current: {
    textColor: '#ffffff',
    textSize: 16,
    textOpacity: 0.8,
    haloColor: '#ffffff',
    haloWidth: 1,
    symbolSpacing: 100,
    allowOverlap: true,
    rotationAlignment: 'map',
    symbolType: 'arrow',
    customSymbol: '→'
  },
  tropicalStorms: {
    opacity: 1,
    showLabels: true
  },
  // Add the following three objects
  meanWaveDirection: {
    textColor: '#ADD8E6',
    textSize: 16,
    textOpacity: 0.8,
    haloColor: '#000000',
    haloWidth: 1,
    symbolSpacing: 100,
    allowOverlap: true,
    rotationAlignment: 'map',
    symbolType: 'arrow',
    customSymbol: '→'
  },
  currentSpeed: {
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
        { value: '4.0kt+', color: 'rgb(139, 0, 0)' }
      ]
  },
  'pressure-gradient': {
      heatmapRadius: 20,
      heatmapIntensity: 0.6,
      fillOpacity: 0.7
  }

};

interface LayerConfigs {
  wind: Record<string, any>;
  pressure: {
    contourWidth: number;
    contourOpacity: number;
    highPressureColor: string;
    mediumPressureColor: string;
    lowPressureColor: string;
  };
  windSpeedValues: {
    textColor: string;
    textSize: number;
    textOpacity: number;
    haloColor: string;
    haloWidth: number;
  };
  swell: Record<string, any>;
  waves: Record<string, any>;
  significantWaveHeight: Record<string, any>;
  symbol: Record<string, any>;
  current: Record<string, any>;
  tropicalStorms: Record<string, any>;
  meanWaveDirection: Record<string, any>;
  currentSpeed: Record<string, any>;
  'pressure-gradient': Record<string, any>;
}

const WeatherLayerConfig: React.FC<{ isOpen?: boolean; onClose?: () => void; activeLayers?: string[] }> = ({
  isOpen = true,
  onClose,
  activeLayers = ['wind']
}) => {
  const [selectedWeatherType, setSelectedWeatherType] = useState(activeLayers[0] || 'wind');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [layerConfigs, setLayerConfigs] = useState<LayerConfigs>(DEFAULT_LAYER_CONFIGS);

  const handleReset = () => {
    const defaultConfig = DEFAULT_LAYER_CONFIGS[selectedWeatherType as keyof LayerConfigs];
    if (defaultConfig) {
      setLayerConfigs(prev => ({
        ...prev,
        [selectedWeatherType]: defaultConfig
      }));

      const configEvent = new CustomEvent('weatherConfigUpdate', {
        detail: {
          layerType: selectedWeatherType,
          config: defaultConfig
        }
      });
      window.dispatchEvent(configEvent);

      toast.success(`${selectedWeatherType.charAt(0).toUpperCase() + selectedWeatherType.slice(1)} layer reset to default settings`);
    }
  };

  const updateConfigValue = (layerType: string, property: string, value: any) => {
    const newConfig = {
      ...layerConfigs[layerType as keyof LayerConfigs],
      [property]: value
    };

    setLayerConfigs(prev => ({
      ...prev,
      [layerType]: newConfig
    }));

    // Apply configuration immediately (real-time)
    const configEvent = new CustomEvent('weatherConfigUpdate', {
      detail: {
        layerType,
        config: newConfig
      }
    });
    window.dispatchEvent(configEvent);
  };

  const updateGradientItem = (layerType: keyof LayerConfigs, index: number, field: 'value' | 'color', newValue: string) => {
    setLayerConfigs(prev => {
      const gradient = prev[layerType].gradient as any[];
      const newGradient = gradient.map((item: any, i: number) =>
        i === index ? { ...item, [field]: newValue } : item
      );
      const newConfig = { ...prev[layerType], gradient: newGradient };

      const configEvent = new CustomEvent('weatherConfigUpdate', {
        detail: { layerType, config: newConfig }
      });
      window.dispatchEvent(configEvent);

      return { ...prev, [layerType]: newConfig };
    });
  };

  const addGradientItem = (layerType: keyof LayerConfigs) => {
    const newItem = { value: '0m', color: 'rgba(100, 100, 100, 0.5)' };
    setLayerConfigs(prev => ({
      ...prev,
      [layerType]: {
        ...prev[layerType],
        gradient: [...(prev[layerType].gradient as any[]), newItem]
      }
    }));
  };

  const removeGradientItem = (layerType: keyof LayerConfigs, index: number) => {
    setLayerConfigs(prev => ({
      ...prev,
      [layerType]: {
        ...prev[layerType],
        gradient: (prev[layerType].gradient as any[]).filter((_: any, i: number) => i !== index)
      }
    }));
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

  // Auto-select first active layer when layers change
  useEffect(() => {
    if (activeLayers.length > 0 && !activeLayers.includes(selectedWeatherType)) {
      setSelectedWeatherType(activeLayers[0]);
    }
  }, [activeLayers, selectedWeatherType]);

  const convertRgbaToHex = (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return '#000000';

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const convertHexToRgba = (hex: string, opacity: number = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgba(0, 0, 0, 1)';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };


  const renderConfigurationPanel = () => {
    const config = layerConfigs[selectedWeatherType as keyof LayerConfigs];
    if (!config) return null;

    // Common Gradient UI Component
    const GradientEditor = ({ layerType }: { layerType: keyof LayerConfigs }) => {
      const layerConfig = layerConfigs[layerType];
      if (!layerConfig || !layerConfig.gradient) return null;

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-700">Color Gradient</Label>
            <Button
              onClick={() => addGradientItem(layerType)}
              size="sm"
              variant="outline"
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {layerConfig.gradient.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateGradientItem(layerType, index, 'value', e.target.value)}
                  className="w-16 h-6 text-xs"
                  placeholder="0m"
                />
                <Input
                  type="color"
                  value={convertRgbaToHex(item.color)}
                  onChange={(e) => {
                    const opacity = parseFloat(item.color.match(/[\d.]+(?=\))/)?.[0] || '1');
                    const newColor = convertHexToRgba(e.target.value, opacity);
                    updateGradientItem(layerType, index, 'color', newColor);
                  }}
                  className="w-8 h-6 p-0 border-2"
                />
                <Button
                  onClick={() => removeGradientItem(layerType, index)}
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  disabled={layerConfig.gradient.length <= 2}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      );
    };


    return (
      <div className="space-y-4">
        {selectedWeatherType === 'pressure' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Pressure Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Contour Width</Label>
              <Slider
                value={[config.contourWidth || 1]}
                onValueChange={([value]) => updateConfigValue('pressure', 'contourWidth', value)}
                min={0.5}
                max={5}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Contour Opacity</Label>
              <Slider
                value={[config.contourOpacity || 0.8]}
                onValueChange={([value]) => updateConfigValue('pressure', 'contourOpacity', value)}
                min={0}
                max={1}
                step={0.05}
                className="flex-1"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-medium text-gray-700">Pressure Line Colors</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 w-20">High (1030mb+)</Label>
                  <Input
                    type="color"
                    value={config.highPressureColor}
                    onChange={(e) => updateConfigValue('pressure', 'highPressureColor', e.target.value)}
                    className="w-16 h-8 p-0 border-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 w-20">Medium (1000-1030mb)</Label>
                  <Input
                    type="color"
                    value={config.mediumPressureColor}
                    onChange={(e) => updateConfigValue('pressure', 'mediumPressureColor', e.target.value)}
                    className="w-16 h-8 p-0 border-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-600 w-20">Low (980-1000mb)</Label>
                  <Input
                    type="color"
                    value={config.lowPressureColor}
                    onChange={(e) => updateConfigValue('pressure', 'lowPressureColor', e.target.value)}
                    className="w-16 h-8 p-0 border-2"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {selectedWeatherType === 'wind' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('wind', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Size</Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('wind', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Wind Barb Opacity</Label>
              <Slider
                value={[config.textOpacity]}
                onValueChange={([value]) => updateConfigValue('wind', 'textOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Color</Label>
              <Input
                type="color"
                value={config.haloColor}
                onChange={(e) => updateConfigValue('wind', 'haloColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Width</Label>
              <Slider
                value={[config.haloWidth]}
                onValueChange={([value]) => updateConfigValue('wind', 'haloWidth', value)}
                min={0}
                max={5}
                step={0.5}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Barb Spacing</Label>
              <Slider
                value={[config.symbolSpacing]}
                onValueChange={([value]) => updateConfigValue('wind', 'symbolSpacing', value)}
                min={20}
                max={200}
                step={10}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.allowOverlap}
                onCheckedChange={(checked) => updateConfigValue('wind', 'allowOverlap', checked)}
              />
              <Label className="text-xs">Allow Overlap</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Speed Unit</Label>
              <Select
                value={config.speedUnit}
                onValueChange={(value) => updateConfigValue('wind', 'speedUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="knots">Knots</SelectItem>
                  <SelectItem value="ms">m/s</SelectItem>
                  <SelectItem value="kmh">km/h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {selectedWeatherType === 'windSpeedValues' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Text Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('windSpeedValues', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Text Size</Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('windSpeedValues', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Text Opacity</Label>
              <Slider
                value={[config.textOpacity]}
                onValueChange={([value]) => updateConfigValue('windSpeedValues', 'textOpacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Color</Label>
              <Input
                type="color"
                value={config.haloColor}
                onChange={(e) => updateConfigValue('windSpeedValues', 'haloColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Halo Width</Label>
              <Slider
                value={[config.haloWidth]}
                onValueChange={([value]) => updateConfigValue('windSpeedValues', 'haloWidth', value)}
                min={0}
                max={5}
                step={0.5}
                className="flex-1"
              />
            </div>
          </>
        )}


        {(selectedWeatherType === 'swell' || selectedWeatherType === 'waves' || selectedWeatherType === 'significantWaveHeight' || selectedWeatherType === 'currentSpeed') && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">
                {selectedWeatherType.charAt(0).toUpperCase() + selectedWeatherType.slice(1).replace(/([A-Z])/g, ' $1')} Configuration
              </Label>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => updateConfigValue(selectedWeatherType, 'fillOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs w-12">{config.fillOpacity}</span>
              </div>
            </div>
            {config.animationSpeed !== undefined && (
              <>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.animationEnabled}
                    onCheckedChange={(checked) => updateConfigValue(selectedWeatherType, 'animationEnabled', checked)}
                  />
                  <Label className="text-xs">Animation</Label>
                </div>
                {config.animationEnabled && (
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
                    <Slider
                      value={[config.animationSpeed * 1000]}
                      onValueChange={([value]) => updateConfigValue(selectedWeatherType, 'animationSpeed', value / 1000)}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="flex-1"
                    />
                  </div>
                )}
              </>
            )}
            <GradientEditor layerType={selectedWeatherType as keyof LayerConfigs} />
          </>
        )}
      </div>
    );
  };


  if (!isOpen) return null;

  return (
    <div className={`fixed top-20 right-4 z-50 transition-transform duration-300 ${isCollapsed ? 'translate-x-[calc(100%-3rem)]' : 'translate-x-0'
      }`}>
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg w-80 max-h-[80vh] overflow-hidden">
        <div className={`flex items-center ${isCollapsed ? 'justify-right' : 'justify-left'} p-4 border-b`}>
          <h3 className="text-lg font-semibold">Weather Layer Config</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 px-3"
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? '◀' : '▶'}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="p-4 max-h-[calc(80vh-4rem)] overflow-y-auto">
            {activeLayers.length > 1 && (
              <div className="mb-4">
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Active Layer
                </Label>
                <Select value={selectedWeatherType} onValueChange={setSelectedWeatherType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select weather type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {activeLayers.map(layer => (
                      <SelectItem key={layer} value={layer}>
                        {layer.charAt(0).toUpperCase() + layer.slice(1).replace(/([A-Z])/g, ' $1')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {renderConfigurationPanel()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherLayerConfig;