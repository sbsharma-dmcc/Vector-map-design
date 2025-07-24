import { Vessel } from '@/utils/vesselMarkers';
import * as turf from '@turf/turf'; // Import turf.js

export type { Vessel } from '@/utils/vesselMarkers';
export type VesselType = 'green' | 'orange' | 'circle' | 'container' | 'oil' | 'chemical-tanker' | 'gas-carrier' | 'lng' | 'bulk-carrier' | 'passenger' | 'barge' | 'cable-layer' | 'refrigerated-cargo' | 'roll-on-roll-off';

export interface VesselEvent {
  id: string;
  vesselId: string;
  timestamp: string;
  eventType: 'departure' | 'arrival' | 'position' | 'status' | 'alert';
  location: string;
  description: string;
}

export interface Route {
  id: string;
  name: string;
  vesselId: string;
  startPort: string;
  endPort: string;
  departureDate: string;
  arrivalDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  distance: number;
  estimatedTime: string;
  coordinates: [number, number][];
  vessels: string[];
}

export const vessels: Vessel[] = [
  // Ensure at least one of each type appears
  {
    id: 'vessel-1',
    name: 'Green Cargo Ship Alpha',
    type: 'green',
    position: [-73.0, 39.5] // North Atlantic (off US East Coast)
  },
  {
    id: 'vessel-2',
    name: 'Orange Vessel Beta',
    type: 'orange',
    position: [-157.5, 21.0] // North Pacific (south of Hawaii)
  },
  {
    id: 'vessel-3',
    name: 'Navigation Beacon Gamma',
    type: 'circle',
    position: [0.0, 47.0] // North Atlantic (mid-ocean west of France)
  },
  {
    id: 'vessel-4',
    name: 'Container Ship Delta',
    type: 'container',
    position: [104.5, 0.5] // South China Sea
  },
  {
    id: 'vessel-5',
    name: 'Oil Tanker Epsilon',
    type: 'oil',
    position: [-122.5, 33.5] // Pacific Ocean (west of California)
  },
  {
    id: 'vessel-6',
    name: 'Chemical Tanker Zeta',
    type: 'chemical-tanker',
    position: [15.0, 60.0] // North Sea
  },
  {
    id: 'vessel-7',
    name: 'Gas Carrier Eta',
    type: 'gas-carrier',
    position: [120.0, 35.0] // East China Sea
  },
  {
    id: 'vessel-8',
    name: 'LNG Carrier Theta',
    type: 'lng',
    position: [-45.0, 20.0] // Mid Atlantic
  },
  {
    id: 'vessel-9',
    name: 'Bulk Carrier Iota',
    type: 'bulk-carrier',
    position: [80.0, 10.0] // Indian Ocean
  },
  {
    id: 'vessel-10',
    name: 'Passenger Ship Kappa',
    type: 'passenger',
    position: [-30.0, 55.0] // North Atlantic
  },
  {
    id: 'vessel-11',
    name: 'Barge Lambda',
    type: 'barge',
    position: [5.0, 52.0] // North Sea
  },
  {
    id: 'vessel-12',
    name: 'Cable Layer Mu',
    type: 'cable-layer',
    position: [-40.0, 40.0] // Mid Atlantic
  },
  {
    id: 'vessel-13',
    name: 'Refrigerated Cargo Nu',
    type: 'refrigerated-cargo',
    position: [130.0, 30.0] // Western Pacific
  },
  {
    id: 'vessel-14',
    name: 'RoRo Ferry Xi',
    type: 'roll-on-roll-off',
    position: [25.0, 60.0] // Baltic Sea
  }
];

export const fourVessels: Vessel[] = [
  {
    id: 'vessel-1',
    name: 'Green Cargo Ship',
    type: 'green',
    position: [-73.0, 39.5],
    icon: '/lovable-uploads/Variant12.svg'
  },
  {
    id: 'vessel-2',
    name: 'Orange Vessel',
    type: 'orange',
    position: [-157.5, 21.0],
    icon: '/lovable-uploads/Variant13.svg'
  },
  {
    id: 'vessel-3',
    name: 'Navigation Beacon',
    type: 'circle',
    position: [0.0, 47.0],
    icon: '/lovable-uploads/d4b87a52-a63f-4c54-9499-15bd05ef9037.png'
  },
  {
    id: 'vessel-4',
    name: 'Container Ship',
    type: 'container',
    position: [104.5, 0.5],
    icon: '/lovable-uploads/container.svg'
  },
  {
    id: 'vessel-5',
    name: 'Oil Tanker',
    type: 'oil',
    position: [-122.5, 33.5], // Pacific Ocean (west of California)
    icon: '/lovable-uploads/oil-tanker.svg'
  },
  {
    id: 'vessel-6',
    name: 'Chemical Tanker',
    type: 'chemical-tanker',
    position: [15.0, 60.0], // North Sea
    icon: '/lovable-uploads/chemical-tanker.svg'
  },
  {
    id: 'vessel-7',
    name: 'Gas Carrier',
    type: 'gas-carrier',
    position: [120.0, 35.0],
    icon: '/lovable-uploads/gas-carrier.svg'
  },
  {
    id: 'vessel-8',
    name: 'LNG Carrier',
    type: 'lng',
    position: [-45.0, 20.0],
    icon: '/lovable-uploads/LNG.svg'
  },
  {
    id: 'vessel-9',
    name: 'Bulk Carrier',
    type: 'bulk-carrier',
    position: [80.0, 10.0],
    icon: '/lovable-uploads/bulk-carrier.svg'
  },
  {
    id: 'vessel-10',
    name: 'Passenger Ship',
    type: 'passenger',
    position: [-30.0, 55.0],
    icon: '/lovable-uploads/passenger.svg'
  },
  {
    id: 'vessel-11',
    name: 'Barge',
    type: 'barge',
    position: [5.0, 52.0],
    icon: '/lovable-uploads/barge.svg'
  },
  {
    id: 'vessel-12',
    name: 'Cable Layer',
    type: 'cable-layer',
    position: [-40.0, 40.0],
    icon: '/lovable-uploads/cable-layer.svg'
  },
  {
    id: 'vessel-13',
    name: 'Refrigerated Cargo',
    type: 'refrigerated-cargo',
    position: [130.0, 30.0],
    icon: '/lovable-uploads/refrigerated-cargo.svg'
  },
  {
    id: 'vessel-14',
    name: 'RoRo Ferry',
    type: 'roll-on-roll-off',
    position: [25.0, 60.0],
    icon: '/lovable-uploads/roll-on-roll-off.svg'
  }
];

// Hardcoded land polygons for testing purposes
const hardcodedLandPolygons = turf.multiPolygon([
  // North America (simplified rectangle)
  [[[-130, 25], [-60, 25], [-60, 50], [-130, 50], [-130, 25]]],
  // Europe/Asia (simplified rectangle)
  [[[0, 30], [180, 30], [180, 70], [0, 70], [0, 30]]]
]);


// Enhanced function to generate more realistic ocean positions

export const generateMockVessels = (): Vessel[] => {
  const oceanRegions = [
    { minLng: -80, maxLng: 20, minLat: 30, maxLat: 70 },     // North Atlantic
    { minLng: -60, maxLng: 20, minLat: -60, maxLat: 30 },    // South Atlantic  
    { minLng: 120, maxLng: -120, minLat: 20, maxLat: 60 },   // North Pacific
    { minLng: 120, maxLng: -70, minLat: -60, maxLat: 20 },   // South Pacific
    { minLng: 20, maxLng: 120, minLat: -60, maxLat: 30 },    // Indian Ocean
    { minLng: -180, maxLng: 180, minLat: 70, maxLat: 85 },   // Arctic Ocean
    { minLng: -180, maxLng: 180, minLat: -80, maxLat: -55 }  // Southern Ocean
  ];

  const vesselTypes: VesselType[] = [
    'green', 'orange', 'circle', 'container', 'oil', 'chemical-tanker',
    'gas-carrier', 'lng', 'bulk-carrier', 'passenger', 'barge', 'cable-layer',
    'refrigerated-cargo', 'roll-on-roll-off'
  ];

  const vesselNames = {
    green: ['Cargo Master', 'Ocean Freight', 'Sea Carrier'],
    orange: ['Trade Wind', 'Pacific Star', 'Atlantic Pioneer'],
    circle: ['Navigation Beacon', 'Weather Buoy', 'Ocean Monitor'],
    container: ['Container Express', 'Box Carrier'],
    oil: ['Black Gold', 'Crude Carrier'],
    'chemical-tanker': ['Chemical Express', 'Hazmat Carrier'],
    'gas-carrier': ['Gas Express', 'LPG Carrier'],
    lng: ['LNG Express', 'Liquefied Star'],
    'bulk-carrier': ['Bulk Express', 'Dry Cargo'],
    passenger: ['Ocean Liner', 'Cruise Star'],
    barge: ['River Barge', 'Coastal Carrier'],
    'cable-layer': ['Cable Master', 'Fiber Express'],
    'refrigerated-cargo': ['Cold Carrier', 'Reefer Express'],
    'roll-on-roll-off': ['RoRo Express', 'Ferry Carrier']
  };

  const generatedVessels: Vessel[] = [];
  const maxAttempts = 100;

  vesselTypes.forEach((type, index) => {
    let found = false;
    let attempt = 0;

    while (!found && attempt < maxAttempts) {
      const region = oceanRegions[Math.floor(Math.random() * oceanRegions.length)];
      let longitude = Math.random() * (region.maxLng - region.minLng) + region.minLng;

      // Handle 180° antimeridian crossing
      if (region.minLng > region.maxLng) {
        const range1 = 180 - region.minLng;
        const range2 = region.maxLng + 180;
        const totalRange = range1 + range2;
        const offset = Math.random() * totalRange;
        longitude = offset < range1 ? region.minLng + offset : -180 + (offset - range1);
      }

      const latitude = Math.random() * (region.maxLat - region.minLat) + region.minLat;
      const position: [number, number] = [longitude, latitude];

      const point = turf.point(position);
      const isOcean = !turf.booleanPointInPolygon(point, hardcodedLandPolygons);

      if (isOcean) {
        const names = vesselNames[type];
        const name = `${names[Math.floor(Math.random() * names.length)]} ${index + 1}`;
        generatedVessels.push({ id: `vessel-${index + 1}`, name, type, position });
        found = true;
      }

      attempt++;
    }

    if (!found) {
      console.warn(`⚠️ Could not place vessel of type "${type}" after ${maxAttempts} attempts.`);
    }
  });

  return generatedVessels;
};



export const getVesselStats = () => {
  const totalVessels = vessels.length;
  const stats: { [key: string]: number } = {
    total: totalVessels,
    active: Math.floor(totalVessels * 0.8),
    inactive: Math.floor(totalVessels * 0.2)
  };

  // Count each vessel type
  const vesselTypes: VesselType[] = [
    'green', 'orange', 'circle', 'container', 'oil', 'chemical-tanker',
    'gas-carrier', 'lng', 'bulk-carrier', 'passenger', 'barge', 'cable-layer',
    'refrigerated-cargo', 'roll-on-roll-off'
  ];

  vesselTypes.forEach(type => {
    stats[type] = vessels.filter(v => v.type === type).length;
  });

  return stats;
};

export const generateMockHistory = (vessels: Vessel[], count: number = 10): VesselEvent[] => {
  const events: VesselEvent[] = [];
  const eventTypes: VesselEvent['eventType'][] = ['departure', 'arrival', 'position', 'status', 'alert'];
  const locations = ['Tokyo Bay', 'Yokohama Port', 'Osaka Bay', 'Kobe Port', 'Nagoya Port', 'Chiba Port', 'Kawasaki Port'];
  
  for (let i = 0; i < count; i++) {
    const vessel = vessels[Math.floor(Math.random() * vessels.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    events.push({
      id: `event-${i + 1}`,
      vesselId: vessel.id,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      eventType,
      location,
      description: `${vessel.name} ${eventType} at ${location}`
    });
  }
  
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateMockRoutes = (vessels: Vessel[]): Route[] => {
  const statuses: Route['status'][] = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  const ports = ['Tokyo Bay', 'Yokohama Port', 'Osaka Bay', 'Kobe Port', 'Nagoya Port', 'Chiba Port'];
  
  return vessels.slice(0, 25).map((vessel, index) => {
    const startPort = ports[Math.floor(Math.random() * ports.length)];
    let endPort = ports[Math.floor(Math.random() * ports.length)];
    while (endPort === startPort) {
      endPort = ports[Math.floor(Math.random() * ports.length)];
    }
    
    const departureDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const arrivalDate = new Date(departureDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    return {
      id: `RT-${String(index + 1).padStart(3, '0')}`,
      name: `Route ${vessel.name}`,
      vesselId: vessel.id,
      startPort,
      endPort,
      departureDate: departureDate.toISOString(),
      arrivalDate: arrivalDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      distance: Math.floor(Math.random() * 1000) + 100,
      estimatedTime: `${Math.floor(Math.random() * 72) + 12} hours`,
      coordinates: [vessel.position, [vessel.position[0] + Math.random() * 2 - 1, vessel.position[1] + Math.random() * 2 - 1]],
      vessels: [vessel.id]
    };
  });
};