
import mapboxgl from 'mapbox-gl';
import { layerConfigs, dtnToken } from './mapConstants';

export const updateWeatherLayer = (
  map: mapboxgl.Map | null,
  layerType: string,
  enabled: boolean,
  toast: (options: { title: string; description: string; variant?: string }) => void
) => {
  // Add comprehensive safety checks
  if (!map) {
    console.log(`Map not ready, skipping layer update for ${layerType}`);
    return;
  }

  // Additional safety check to ensure map methods exist
  if (typeof map.getSource !== 'function' || typeof map.getLayer !== 'function') {
    console.log(`Map methods not available, skipping layer update for ${layerType}`);
    return;
  }

  const sourceId = `${layerType}-layer`;
  const layerId = `${layerType}-layer-render`;
  const config = layerConfigs[layerType as keyof typeof layerConfigs];
  
  if (!config) return;

  console.log(`Updating weather layer ${layerType}, enabled: ${enabled}`);

  try {
    if (enabled) {
      // Add or update the source
      if (!map.getSource(sourceId)) {
        console.log("Adding new source:", sourceId);
        map.addSource(sourceId, {
          type: "raster",
          tiles: [
            `https://map.api.dtn.com/v2/tiles/${config.dtnLayerId}/${config.tileSetId}/{z}/{x}/{y}.webp?size=512&unit=metric-marine&token=${dtnToken}`,
          ],
          tileSize: 512,
        });
      }

      if (!map.getLayer(layerId)) {
        console.log("Adding new layer:", layerId);
        const layers = map.getStyle().layers;
        const topLayer = layers.find(layer => layer.type === 'symbol' && layer.id.includes('label'));

        map.addLayer({
          id: layerId,
          type: "raster",
          source: sourceId,
          paint: {
            "raster-opacity": 0.9
          }
        }, topLayer ? topLayer.id : undefined);
      } else {
        console.log("Updating existing layer:", layerId);
        // Make sure layer is visible and update opacity
        map.setLayoutProperty(layerId, 'visibility', 'visible');
        map.setPaintProperty(layerId, 'raster-opacity', 0.9);
      }
      
      toast({
        title: `${layerType.charAt(0).toUpperCase() + layerType.slice(1)} Layer`,
        description: `Successfully loaded ${layerType} overlay`
      });
    } else {
      // Hide the layer
      if (map.getLayer(layerId)) {
        console.log("Hiding layer:", layerId);
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    }
  } catch (error) {
    console.error(`Error updating weather layer ${layerType}:`, error);
    toast({
      title: "Layer Error",
      description: `Failed to update ${layerType} layer`,
      variant: "destructive"
    });
  }
};
