import mapboxgl from 'mapbox-gl';

export interface Vessel {
  id: string;
  name: string;
  type: 'green' | 'orange' | 'circle' | 'container' | 'oil' | 'chemical-tanker' | 'gas-carrier' | 'lng' | 'bulk-carrier' | 'passenger' | 'barge' | 'cable-layer' | 'refrigerated-cargo' | 'roll-on-roll-off';
  position: [number, number];
  icon?: string; // Path to the vessel icon image
}

export type VesselType = 'green' | 'orange' | 'circle' | 'container' | 'oil' | 'chemical-tanker' | 'gas-carrier' | 'lng' | 'bulk-carrier' | 'passenger' | 'barge' | 'cable-layer' | 'refrigerated-cargo' | 'roll-on-roll-off';

// Helper to get the correct image path based on vessel type
const getVesselIconPath = (type: VesselType) => {
  const iconPaths: { [key in VesselType]: string } = {
    'circle': '/lovable-uploads/d4b87a52-a63f-4c54-9499-15bd05ef9037.png', // Orange circle icon
    'green': '/lovable-uploads/Variant12.svg', // Green vessel icon
    'orange': '/lovable-uploads/Variant13.svg', // Orange vessel icon
    'container': '/lovable-uploads/container.svg', // Teal container ship
    'oil': '/lovable-uploads/oil-tanker.svg', // Orange oil tanker
    'chemical-tanker': '/lovable-uploads/chemical-tanker.svg', // Red chemical tanker
    'gas-carrier': '/lovable-uploads/gas-carrier.svg', // Light blue gas carrier
    'lng': '/lovable-uploads/LNG.svg', // Green LNG carrier
    'bulk-carrier': '/lovable-uploads/bulk-carrier.svg', // Purple bulk carrier
    'passenger': '/lovable-uploads/passenger.svg', // Blue passenger ship
    'barge': '/lovable-uploads/barge.svg', // Brown barge
    'cable-layer': '/lovable-uploads/cable-layer.svg', // Gray cable layer
    'refrigerated-cargo': '/lovable-uploads/refrigerated-cargo.svg', // Light green reefer
    'roll-on-roll-off': '/lovable-uploads/roll-on-roll-off.svg' // Yellow RoRo ferry
  };

  return iconPaths[type] || iconPaths.green; // Fallback to green if type not found
};

// Function to get display name for vessel type
const getVesselTypeName = (type: VesselType): string => {
  const typeNames: { [key in VesselType]: string } = {
    'green': 'Green Vessel',
    'orange': 'Orange Vessel',
    'circle': 'Navigation Beacon',
    'container': 'Container Ship',
    'oil': 'Oil Tanker',
    'chemical-tanker': 'Chemical Tanker',
    'gas-carrier': 'Gas Carrier',
    'lng': 'LNG Carrier',
    'bulk-carrier': 'Bulk Carrier',
    'passenger': 'Passenger Ship',
    'barge': 'Barge',
    'cable-layer': 'Cable Layer',
    'refrigerated-cargo': 'Refrigerated Cargo',
    'roll-on-roll-off': 'RoRo Ferry'
  };

  return typeNames[type] || 'Unknown Vessel';
};

// Function to load image into Mapbox map
const loadImageToMap = (map: mapboxgl.Map, id: string, url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (map.hasImage(id)) {
      resolve(); // Image already loaded
      return;
    }
    map.loadImage(url, (error, image) => {
      if (error) {
        console.error(`Failed to load image ${id}:`, error);
        reject(error);
        return;
      }
      if (image) {
        map.addImage(id, image);
        resolve();
      } else {
        reject(new Error(`Image data is null for ${id}`));
      }
    });
  });
};

export const createVesselMarkers = (
  map: mapboxgl.Map,
  vessels: Vessel[],
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>,
  onVesselDragEnd: (vesselId: string, newPosition: [number, number]) => void
) => {
  // Cleanup existing markers before creating new ones
  Object.values(markersRef.current).forEach(marker => marker.remove());
  markersRef.current = {};

  vessels.forEach(vessel => {
    const el = document.createElement('div');
    el.className = 'vessel-marker';
    el.style.backgroundImage = `url(${getVesselIconPath(vessel.type)})`;
    
    // Adjust size based on vessel type
    if (vessel.type === 'circle') {
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
    } else {
      el.style.width = '12px';
      el.style.height = '32px';
    }
    
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center';
    el.style.cursor = 'pointer';

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true
    })
    .setLngLat(vessel.position)
    .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const newPosition: [number, number] = [lngLat.lng, lngLat.lat];
      onVesselDragEnd(vessel.id, newPosition);
    });

    // Add a popup to the marker with enhanced information
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="padding: 12px; font-family: Arial, sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #333;">${vessel.name}</h3>
        <div style="margin-bottom: 6px;">
          <strong style="color: #666;">Type:</strong> ${getVesselTypeName(vessel.type)}
        </div>
        <div style="margin-bottom: 6px;">
          <strong style="color: #666;">Position:</strong> ${vessel.position[1].toFixed(4)}°N, ${vessel.position[0].toFixed(4)}°E
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 8px;">
          Vessel ID: ${vessel.id}
        </div>
      </div>
    `);
    marker.setPopup(popup);

    markersRef.current[vessel.id] = marker;
  });

  console.log(`Created ${vessels.length} draggable vessel markers with ${new Set(vessels.map(v => v.type)).size} different types.`);
};

// --- CLEANUP ---
export const cleanupVesselMarkers = (
  map: mapboxgl.Map,
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>
) => {
  // Remove markers
  Object.values(markersRef.current).forEach(marker => marker.remove());
  markersRef.current = {};

  // Remove old layer and source if they somehow still exist from a previous version
  if (map.getLayer('vessels-layer')) {
    map.removeLayer('vessels-layer');
  }
  if (map.getSource('vessels-source')) {
    map.removeSource('vessels-source');
  }
  
  console.log('Finished cleaning up vessel markers and any old layers/sources.');
};