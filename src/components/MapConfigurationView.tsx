
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import WeatherLayerConfig from './WeatherLayerConfig';
import WeatherConfigDrafts from './WeatherConfigDrafts';
import { defaultMapToken } from '@/utils/mapConstants';

interface MapConfigurationViewProps {
  map: mapboxgl.Map;
  folder: { id: string; name: string };
  onSave: (config: { weatherConfig: Record<string, unknown>; mapSettings: Record<string, unknown> }) => void;
  onClose: () => void;
}

const MapConfigurationView: React.FC<MapConfigurationViewProps> = ({
  map,
  folder,
  onSave,
  onClose
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [currentWeatherConfig, setCurrentWeatherConfig] = useState(map.weatherConfig || {});
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = defaultMapToken;
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: map.mapSettings?.style || 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7',
      center: map.mapSettings?.center || [83.167, 6.887],
      zoom: map.mapSettings?.zoom || 4,
      attributionControl: false
    });

    // Add navigation controls
    mapRef.current.addControl(
      new mapboxgl.NavigationControl(),
      'bottom-right'
    );

    // Listen for weather configuration updates
    const handleWeatherConfigUpdate = (event: CustomEvent) => {
      const { layerType, config } = event.detail;
      console.log('Weather config update:', layerType, config);
      
      setCurrentWeatherConfig(prev => ({
        ...prev,
        [layerType]: config
      }));
    };

    window.addEventListener('weatherConfigUpdate', handleWeatherConfigUpdate);

    return () => {
      window.removeEventListener('weatherConfigUpdate', handleWeatherConfigUpdate);
      mapRef.current?.remove();
    };
  }, [map]);

  const handleSaveConfiguration = () => {
    const mapSettings = {
      center: mapRef.current?.getCenter().toArray() || [83.167, 6.887],
      zoom: mapRef.current?.getZoom() || 4,
      style: mapRef.current?.getStyle()?.sprite || 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7'
    };

    const fullConfig = {
      weatherConfig: currentWeatherConfig,
      mapSettings
    };

    onSave(fullConfig);
    
    toast({
      title: "Configuration Saved",
      description: `Map "${map.name}" configuration has been saved successfully`
    });
  };

  const handleShareMap = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/maps/shared?folder=${folder.id}&map=${map.id}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Share URL Copied",
        description: "Map share URL has been copied to clipboard"
      });
    }).catch(() => {
      toast({
        title: "Share URL",
        description: shareUrl
      });
    });
  };

  const handleLoadDraftConfig = (config: any) => {
    setCurrentWeatherConfig(config);
    
    // Emit event to update weather layers
    Object.keys(config).forEach(layerType => {
      const configEvent = new CustomEvent('weatherConfigUpdate', {
        detail: {
          layerType,
          config: config[layerType]
        }
      });
      window.dispatchEvent(configEvent);
    });
  };

  return (
    <div className="flex h-[80vh] gap-4">
      {/* Map View */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0 rounded-lg border" />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="flex gap-2">
            <Button onClick={handleSaveConfiguration} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleShareMap} size="sm" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-96 flex flex-col">
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Map Configuration</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <Tabs defaultValue="weather" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weather">Weather</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weather" className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <WeatherLayerConfig />
                </div>
              </TabsContent>
              
              <TabsContent value="drafts" className="flex-1 overflow-y-auto">
                <WeatherConfigDrafts 
                  currentConfig={currentWeatherConfig}
                  onLoadConfig={handleLoadDraftConfig}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapConfigurationView;
