import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface LayerConfig {
  visible?: boolean;
  arrowColor?: string;
  textColor?: string;
  textSize?: number;
  textOpacity?: number;
  symbolSpacing?: number;
  allowOverlap?: boolean;
  speedUnit?: string;
  colorScheme?: string;
  fillOutlineColor?: string;
  fillOpacity?: number;
  animationSpeed?: number;
  animationEnabled?: boolean;
  trackColor?: string;
  coneColor?: string;
  opacity?: number;
  showLabels?: boolean;
  color?: string;
}

interface LayerConfigPanelProps {
  activeLayers: string[];
  layerConfigs: Record<string, LayerConfig>;
  onConfigChange: (layerType: string, config: LayerConfig) => void;
  onToggleLayer: (layerType: string, visible: boolean) => void;
}

const LayerConfigPanel: React.FC<LayerConfigPanelProps> = ({
  activeLayers,
  layerConfigs,
  onConfigChange,
  onToggleLayer
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const { toast } = useToast();

  // Load panel state from session storage
  useEffect(() => {
    const savedPanelState = sessionStorage.getItem('layerConfigPanelState');
    if (savedPanelState) {
      const { isOpen: savedIsOpen } = JSON.parse(savedPanelState);
      setIsOpen(savedIsOpen);
    }
  }, []);

  // Save panel state to session storage
  useEffect(() => {
    sessionStorage.setItem('layerConfigPanelState', JSON.stringify({ isOpen }));
  }, [isOpen]);

  // Auto-select first active layer
  useEffect(() => {
    if (activeLayers.length > 0 && !selectedLayer) {
      setSelectedLayer(activeLayers[0]);
    } else if (activeLayers.length === 0) {
      setSelectedLayer('');
    } else if (!activeLayers.includes(selectedLayer)) {
      setSelectedLayer(activeLayers[0] || '');
    }
  }, [activeLayers, selectedLayer]);

  // Auto-save configurations on change
  useEffect(() => {
    const configsToSave = {};
    activeLayers.forEach(layer => {
      configsToSave[layer] = layerConfigs[layer];
    });
    
    if (Object.keys(configsToSave).length > 0) {
      sessionStorage.setItem('savedLayerConfigs', JSON.stringify(configsToSave));
    }
  }, [layerConfigs, activeLayers]);

  const renderWindConfig = () => {
    const config = layerConfigs.wind || {};
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.visible !== false}
            onCheckedChange={(checked) => onToggleLayer('wind', checked)}
          />
          <Label>Show Layer</Label>
        </div>

        <div>
          <Label>Arrow Color</Label>
          <Input
            type="color"
            value={config.arrowColor || '#ffffff'}
            onChange={(e) => onConfigChange('wind', { ...config, arrowColor: e.target.value })}
            className="h-8"
          />
        </div>

        <div>
          <Label>Text Color</Label>
          <Input
            type="color"
            value={config.textColor || '#ffffff'}
            onChange={(e) => onConfigChange('wind', { ...config, textColor: e.target.value })}
            className="h-8"
          />
        </div>
        
        <div>
          <Label>Text Size: {config.textSize || 16}px</Label>
          <Slider
            value={[config.textSize || 16]}
            onValueChange={(value) => onConfigChange('wind', { ...config, textSize: value[0] })}
            min={8}
            max={32}
            step={1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Text Opacity: {((config.textOpacity || 0.9) * 100).toFixed(0)}%</Label>
          <Slider
            value={[config.textOpacity || 0.9]}
            onValueChange={(value) => onConfigChange('wind', { ...config, textOpacity: value[0] })}
            min={0}
            max={1}
            step={0.1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Symbol Spacing: {config.symbolSpacing || 80}px</Label>
          <Slider
            value={[config.symbolSpacing || 80]}
            onValueChange={(value) => onConfigChange('wind', { ...config, symbolSpacing: value[0] })}
            min={20}
            max={200}
            step={10}
            className="mt-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={config.allowOverlap || false}
            onCheckedChange={(checked) => onConfigChange('wind', { ...config, allowOverlap: checked })}
          />
          <Label>Allow Symbol Overlap</Label>
        </div>

        <div>
          <Label>Speed Unit</Label>
          <Select 
            value={config.speedUnit || 'knots'} 
            onValueChange={(value) => onConfigChange('wind', { ...config, speedUnit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="knots">Knots</SelectItem>
              <SelectItem value="mps">m/s</SelectItem>
              <SelectItem value="kmh">km/h</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderSwellConfig = () => {
    const config = layerConfigs.swell || {};
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.visible !== false}
            onCheckedChange={(checked) => onToggleLayer('swell', checked)}
          />
          <Label>Show Layer</Label>
        </div>

        <div>
          <Label>Fill Color Scheme</Label>
          <Select 
            value={config.colorScheme || 'blue-green'} 
            onValueChange={(value) => onConfigChange('swell', { ...config, colorScheme: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue-green">Blue-Green</SelectItem>
              <SelectItem value="rainbow">Rainbow</SelectItem>
              <SelectItem value="viridis">Viridis</SelectItem>
              <SelectItem value="plasma">Plasma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Outline Color</Label>
          <Input
            type="color"
            value={config.fillOutlineColor || '#000000'}
            onChange={(e) => onConfigChange('swell', { ...config, fillOutlineColor: e.target.value })}
            className="h-8"
          />
        </div>
        
        <div>
          <Label>Fill Opacity: {((config.fillOpacity || 0.9) * 100).toFixed(0)}%</Label>
          <Slider
            value={[config.fillOpacity || 0.9]}
            onValueChange={(value) => onConfigChange('swell', { ...config, fillOpacity: value[0] })}
            min={0}
            max={1}
            step={0.1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Animation Speed: {config.animationSpeed || 0.0006}</Label>
          <Slider
            value={[config.animationSpeed || 0.0006]}
            onValueChange={(value) => onConfigChange('swell', { ...config, animationSpeed: value[0] })}
            min={0.0001}
            max={0.002}
            step={0.0001}
            className="mt-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={config.animationEnabled || false}
            onCheckedChange={(checked) => onConfigChange('swell', { ...config, animationEnabled: checked })}
          />
          <Label>Enable Animation</Label>
        </div>
      </div>
    );
  };

  const renderTropicalStormsConfig = () => {
    const config = layerConfigs.tropicalStorms || {};
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.visible !== false}
            onCheckedChange={(checked) => onToggleLayer('tropicalStorms', checked)}
          />
          <Label>Show Layer</Label>
        </div>

        <div>
          <Label>Storm Track Color</Label>
          <Input
            type="color"
            value={config.trackColor || '#ff0000'}
            onChange={(e) => onConfigChange('tropicalStorms', { ...config, trackColor: e.target.value })}
            className="h-8"
          />
        </div>

        <div>
          <Label>Cone Color</Label>
          <Input
            type="color"
            value={config.coneColor || '#ffff00'}
            onChange={(e) => onConfigChange('tropicalStorms', { ...config, coneColor: e.target.value })}
            className="h-8"
          />
        </div>

        <div>
          <Label>Layer Opacity: {((config.opacity || 1) * 100).toFixed(0)}%</Label>
          <Slider
            value={[config.opacity || 1]}
            onValueChange={(value) => onConfigChange('tropicalStorms', { ...config, opacity: value[0] })}
            min={0}
            max={1}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={config.showLabels !== false}
            onCheckedChange={(checked) => onConfigChange('tropicalStorms', { ...config, showLabels: checked })}
          />
          <Label>Show Storm Labels</Label>
        </div>
      </div>
    );
  };

  const renderGenericConfig = (layerType: string) => {
    const config = layerConfigs[layerType] || {};
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.visible !== false}
            onCheckedChange={(checked) => onToggleLayer(layerType, checked)}
          />
          <Label>Show Layer</Label>
        </div>

        <div>
          <Label>Color</Label>
          <Input
            type="color"
            value={config.color || '#ffffff'}
            onChange={(e) => onConfigChange(layerType, { ...config, color: e.target.value })}
            className="h-8"
          />
        </div>

        <div>
          <Label>Opacity: {((config.opacity || 1) * 100).toFixed(0)}%</Label>
          <Slider
            value={[config.opacity || 1]}
            onValueChange={(value) => onConfigChange(layerType, { ...config, opacity: value[0] })}
            min={0}
            max={1}
            step={0.1}
            className="mt-2"
          />
        </div>
      </div>
    );
  };

  const renderConfigContent = () => {
    if (!selectedLayer) return null;

    switch (selectedLayer) {
      case 'wind':
        return renderWindConfig();
      case 'swell':
        return renderSwellConfig();
      case 'tropicalStorms':
        return renderTropicalStormsConfig();
      default:
        return renderGenericConfig(selectedLayer);
    }
  };

  if (activeLayers.length === 0) return null;

  return (
    <div className={`fixed top-4 right-4 z-50`}>
      <div className={`relative transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-2 left-2 z-10 h-8 w-8 p-0 bg-background/80 rounded-full"
        >
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Card className="w-80 max-h-[80vh] overflow-hidden shadow-lg bg-background/95 backdrop-blur-sm border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center">
              <Settings className="h-5 w-5 mr-2" />
              <CardTitle className="text-lg">Layer Configuration</CardTitle>
            </div>
          </CardHeader>
          
          {isOpen && (
            <CardContent className="space-y-4 max-h-[calc(80vh-6rem)] overflow-y-auto">
              {activeLayers.length > 1 && (
                <div>
                  <Label>Active Layer</Label>
                  <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLayers.map(layer => (
                        <SelectItem key={layer} value={layer}>
                          {layer.charAt(0).toUpperCase() + layer.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {renderConfigContent()}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LayerConfigPanel;