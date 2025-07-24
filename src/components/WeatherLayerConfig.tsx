
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
    customSymbol: '→'
  },
  current: {
    textColor: '#f9f9ff',
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
  tropicalStorms: {
    opacity: 1,
    showLabels: true
  }
};

interface LayerConfigs {
  wind: Record<string, unknown>;
  pressure: {
    contourWidth: number;
    contourOpacity: number;
    highPressureColor: string;
    mediumPressureColor: string;
    lowPressureColor: string;
  };
  swell: Record<string, unknown>;
  waves: Record<string, unknown>;
  symbol: Record<string, unknown>;
  current: Record<string, unknown>;
  tropicalStorms: Record<string, unknown>;
}

const WeatherLayerConfig: React.FC<{ isOpen?: boolean; onClose?: () => void; activeLayers?: string[] }> = ({ 
  isOpen = true, 
  onClose, 
  activeLayers = ['wind'] 
}) => {
  const [selectedWeatherType, setSelectedWeatherType] = useState(activeLayers[0] || 'wind');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleReset = () => {
    const defaultConfig = DEFAULT_LAYER_CONFIGS[selectedWeatherType];
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
  
  const [layerConfigs, setLayerConfigs] = useState<LayerConfigs>({
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
        { value: '0m', color: 'rgb(7, 33, 68)' },
        { value: '0.5m', color: 'rgb(25, 38, 189)' },
        { value: '1m', color: 'rgb(12, 94, 170)' },
        { value: '1.5m', color: 'rgb(13, 123, 194)' },
        { value: '2m', color: 'rgb(22, 182, 179)' },
        { value: '2.5m', color: 'rgb(21, 213, 165)' },
        { value: '3m', color: 'rgb(16, 177, 83)' },
        { value: '3.5m', color: 'rgb(130, 197, 16)' },
        { value: '4m', color: 'rgb(209, 209, 18)' },
        { value: '4.5m', color: 'rgb(197, 129, 30)' },
        { value: '5m', color: 'rgb(195, 82, 21)' },
        { value: '6m', color: 'rgb(176, 63, 18)' },
        { value: '7m', color: 'rgb(224, 82, 25)' },
        { value: '8m', color: 'rgb(198, 20, 28)' },
        { value: '9m', color: 'rgb(143, 10, 16)' },
        { value: '10m+', color: 'rgb(86, 0, 29)' }
      ]

    },
    waves: {
      fillOpacity: 0.8,
      fillOutlineColor: 'transparent',
      animationSpeed: 0.0006,
      animationEnabled: false,
      fillAntialias: true,
      smoothing: true,
      blurRadius: 2,
      edgeFeathering: 1.5,
      gradient: [
        { value: '0.0', color: 'rgba(0, 0, 178, 0.2)' },
        { value: '0.5', color: 'rgba(0, 50, 255, 0.3)' },
        { value: '1.0', color: 'rgba(0, 102, 255, 0.4)' },
        { value: '1.5', color: 'rgba(51, 204, 255, 0.45)' },
        { value: '2.0', color: 'rgba(102, 255, 255, 0.5)' },
        { value: '2.5', color: 'rgba(0, 255, 204, 0.55)' },
        { value: '3.0', color: 'rgba(0, 255, 102, 0.6)' },
        { value: '3.5', color: 'rgba(153, 255, 0, 0.65)' },
        { value: '4.0', color: 'rgba(255, 255, 0, 0.7)' },
        { value: '4.5', color: 'rgba(255, 221, 0, 0.72)' },
        { value: '5.0', color: 'rgba(255, 170, 0, 0.74)' },
        { value: '6.0', color: 'rgba(255, 128, 0, 0.76)' },
        { value: '7.0', color: 'rgba(255, 64, 0, 0.78)' },
        { value: '8.0', color: 'rgba(255, 0, 0, 0.8)' },
        { value: '9.0', color: 'rgba(255, 153, 153, 0.85)' },
        { value: '10.0', color: 'rgba(255, 204, 255, 0.88)' },
        { value: '11.0', color: 'rgba(255, 153, 255, 0.9)' },
        { value: '12.0', color: 'rgba(255, 0, 255, 0.92)' },
        { value: '13.0', color: 'rgba(204, 0, 204, 0.94)' },
        { value: '14.0', color: 'rgba(153, 0, 204, 0.96)' },
        { value: '15.0', color: 'rgba(170, 170, 170, 1)' }
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
      customSymbol: '→'
    },
    current: {
      textColor: '#f9f9ff',
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
    tropicalStorms: {
      opacity: 1,
      showLabels: true
    }
  });

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

  // Enhanced configuration update functions with real-time application
  const updateConfigValue = (layerType: string, property: string, value: any) => {
    const newConfig = {
      ...layerConfigs[layerType],
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

  const updateSwellGradientItem = (index: number, field: 'value' | 'color', newValue: string) => {
    setLayerConfigs(prev => {
      const gradient = prev.swell.gradient as any[];
      const newGradient = gradient.map((item: any, i: number) => 
        i === index ? { ...item, [field]: newValue } : item
      );
      const newConfig = { ...prev.swell, gradient: newGradient };
      
      const configEvent = new CustomEvent('weatherConfigUpdate', {
        detail: { layerType: 'swell', config: newConfig }
      });
      window.dispatchEvent(configEvent);

      return { ...prev, swell: newConfig };
    });
  };

  const addSwellGradientItem = () => {
    const newItem = { value: '0m', color: 'rgba(100, 100, 100, 0.5)', opacity: 0.5 };
    setLayerConfigs(prev => ({
      ...prev,
      swell: {
        ...prev.swell,
        gradient: [...(prev.swell.gradient as any[]), newItem]
      }
    }));
  };

  const removeSwellGradientItem = (index: number) => {
    setLayerConfigs(prev => ({
      ...prev,
      swell: {
        ...prev.swell,
        gradient: (prev.swell.gradient as any[]).filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const updateWindWaveGradientItem = (
    index: number,
    field: 'value' | 'color',
    newValue: string
  ) => {
    setLayerConfigs(prev => {
      const gradient = prev.waves.gradient as any[];
      const newGradient = gradient.map((item: any, i: number) =>
        i === index ? { ...item, [field]: newValue } : item
      );
      const newConfig = { ...prev.waves, gradient: newGradient };

      const configEvent = new CustomEvent('weatherConfigUpdate', {
        detail: { layerType: 'waves', config: newConfig }
      });
      window.dispatchEvent(configEvent);

      return { ...prev, waves: newConfig };
    });
  };

  const addWindWaveGradientItem = () => {
    const newItem = { value: '0.0', color: 'rgba(100, 100, 100, 0.5)', opacity: 0.5 };
    setLayerConfigs(prev => ({
      ...prev,
      waves: {
        ...prev.waves,
        gradient: [...(prev.waves.gradient as any[]), newItem]
      }
    }));
  };

  const removeWindWaveGradientItem = (index: number) => {
    setLayerConfigs(prev => ({
      ...prev,
      waves: {
        ...prev.waves,
        gradient: (prev.waves.gradient as any[]).filter((_: any, i: number) => i !== index)
      }
    }));
  };


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


  const convertRgbToHex = (rgbString: string) => {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgbString;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const convertHexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderConfigurationPanel = () => {
    const config = layerConfigs[selectedWeatherType];

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

        {selectedWeatherType === 'swell' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Swell Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => updateConfigValue('swell', 'fillOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs w-12">{config.fillOpacity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.animationEnabled}
                onCheckedChange={(checked) => updateConfigValue('swell', 'animationEnabled', checked)}
              />
              <Label className="text-xs">Animation</Label>
            </div>

            {config.animationEnabled && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
                <Slider
                  value={[config.animationSpeed * 1000]}
                  onValueChange={([value]) => updateConfigValue('swell', 'animationSpeed', value / 1000)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="flex-1"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700">Color Gradient</Label>
                <Button
                  onClick={addSwellGradientItem}
                  size="sm"
                  variant="outline"
                  className="h-6 px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {config.gradient.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateSwellGradientItem(index, 'value', e.target.value)}
                      className="w-16 h-6 text-xs"
                      placeholder="0m"
                    />
                    <Input
                      type="color"
                      value={convertRgbaToHex(item.color)}
                      onChange={(e) => {
                        const opacity = parseFloat(item.color.match(/[\d.]+(?=\))/)?.[0] || '1');
                        const newColor = convertHexToRgba(e.target.value, opacity);
                        updateSwellGradientItem(index, 'color', newColor);
                      }}
                      className="w-8 h-6 p-0 border-2"
                    />
                    <Button
                      onClick={() => removeSwellGradientItem(index)}
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      disabled={config.gradient.length <= 2}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {selectedWeatherType === 'waves' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Wind Waves Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Fill Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.fillOpacity]}
                  onValueChange={([value]) => updateConfigValue('waves', 'fillOpacity', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs w-12">{config.fillOpacity}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.animationEnabled}
                onCheckedChange={(checked) =>
                  updateConfigValue('waves', 'animationEnabled', checked)
                }
              />
              <Label className="text-xs">Animation</Label>
            </div>

            {config.animationEnabled && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Animation Speed</Label>
                <Slider
                  value={[config.animationSpeed * 1000]}
                  onValueChange={([value]) => updateConfigValue('waves', 'animationSpeed', value / 1000)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="flex-1"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700">Color Gradient</Label>
                <Button
                  onClick={addWindWaveGradientItem}
                  size="sm"
                  variant="outline"
                  className="h-6 px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {config.gradient.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateWindWaveGradientItem(index, 'value', e.target.value)}
                      className="w-16 h-6 text-xs"
                      placeholder="0m"
                    />
                    <Input
                      type="color"
                      value={convertRgbaToHex(item.color)}
                      onChange={(e) => {
                        const opacity = parseFloat(item.color.match(/[\d.]+(?=\))/)?.[0] || '1');
                        const newColor = convertHexToRgba(e.target.value, opacity);
                        updateWindWaveGradientItem(index, 'color', newColor);
                      }}
                      className="w-8 h-6 p-0 border-2"
                    />
                    <Button
                      onClick={() => removeWindWaveGradientItem(index)}
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      disabled={config.gradient.length <= 2}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}


        {selectedWeatherType === 'symbol' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Type</Label>
              <Select 
                value={config.symbolType} 
                onValueChange={(value) => updateConfigValue('symbol', 'symbolType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">Arrow (→)</SelectItem>
                  <SelectItem value="triangle">Triangle (▲)</SelectItem>
                  <SelectItem value="circle">Circle (●)</SelectItem>
                  <SelectItem value="square">Square (■)</SelectItem>
                  <SelectItem value="custom">Custom Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.symbolType === 'custom' && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Custom Symbol</Label>
                <Input
                  type="text"
                  value={config.customSymbol}
                  onChange={(e) => updateConfigValue('symbol', 'customSymbol', e.target.value)}
                  placeholder="Enter custom symbol (e.g., ★, ✈, ⚡)"
                  maxLength={3}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('symbol', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Size <span className="text-gray-500">({config.textSize})</span></Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('symbol', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>
          </>
        )}

        {selectedWeatherType === 'current' && (
          <>
            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Type</Label>
              <Select 
                value={config.symbolType} 
                onValueChange={(value) => updateConfigValue('current', 'symbolType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arrow">Arrow (→)</SelectItem>
                  <SelectItem value="triangle">Triangle (▲)</SelectItem>
                  <SelectItem value="circle">Circle (●)</SelectItem>
                  <SelectItem value="square">Square (■)</SelectItem>
                  <SelectItem value="custom">Custom Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.symbolType === 'custom' && (
              <div>
                <Label className="text-xs font-medium text-gray-700">Custom Symbol</Label>
                <Input
                  type="text"
                  value={config.customSymbol}
                  onChange={(e) => updateConfigValue('current', 'customSymbol', e.target.value)}
                  placeholder="Enter custom symbol (e.g., ★, ✈, ⚡)"
                  maxLength={3}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Color</Label>
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfigValue('current', 'textColor', e.target.value)}
                className="w-full h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Symbol Size <span className="text-gray-500">({config.textSize})</span></Label>
              <Slider
                value={[config.textSize]}
                onValueChange={([value]) => updateConfigValue('current', 'textSize', value)}
                min={8}
                max={32}
                step={1}
                className="flex-1"
              />
            </div>
          </>
        )}

        {selectedWeatherType === 'tropicalStorms' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">Tropical Storms Configuration</Label>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Storm Opacity</Label>
              <Slider
                value={[config.opacity]}
                onValueChange={([value]) => updateConfigValue('tropicalStorms', 'opacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={config.showLabels}
                onCheckedChange={(checked) => updateConfigValue('tropicalStorms', 'showLabels', checked)}
              />
              <Label className="text-xs">Show Storm Labels</Label>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-transform duration-300 ${
      isCollapsed ? 'translate-x-[calc(100%-3rem)]' : 'translate-x-0'
    }`}>
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg w-80 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
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
                        {layer.charAt(0).toUpperCase() + layer.slice(1)}
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
