export interface VoyageWaypoint {
  id: string;
  waypointNumber: number;
  latitude: number;
  longitude: number;
  locked: boolean;
  eta?: string;
  speed?: number;
  heading?: number;
  plannedFuelConsumption?: number;
  weatherConditions?: {
    windSpeed?: number;
    windDirection?: number;
    waveHeight?: number;
    visibility?: number;
  };
}

export interface VoyageConfiguration {
  voyageId: string;
  vesselId: string;
  voyageName: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  
  // Master Intended Route
  masterIntendedRoute: {
    enabled: boolean;
    waypoints: VoyageWaypoint[];
    uploadedFile?: {
      name: string;
      type: 'rtz' | 'csv' | 'json';
      uploadedAt: string;
    };
  };
  
  // Vessel information
  vessel: {
    name: string;
    imo: string;
    type: string;
    currentPosition: {
      latitude: number;
      longitude: number;
      timestamp: string;
    };
    characteristics: {
      length: number;
      beam: number;
      draft: number;
      grossTonnage: number;
      deadweight: number;
      maxSpeed: number;
      fuelCapacity: number;
    };
  };
  
  // Route planning
  routePlanning: {
    startPort: {
      name: string;
      code: string;
      coordinates: [number, number];
    };
    endPort: {
      name: string;
      code: string;
      coordinates: [number, number];
    };
    plannedDeparture: string;
    plannedArrival: string;
    alternativeRoutes: Array<{
      id: string;
      name: string;
      waypoints: VoyageWaypoint[];
      estimatedDuration: number;
      estimatedFuelConsumption: number;
      weatherRating: 'good' | 'moderate' | 'poor';
    }>;
  };
  
  // Weather integration
  weatherConfig: {
    enabled: boolean;
    autoUpdate: boolean;
    updateInterval: number; // in minutes
    weatherSources: string[];
    alertThresholds: {
      windSpeed: number;
      waveHeight: number;
      visibility: number;
    };
  };
  
  // Reporting configuration
  reporting: {
    intervalMinutes: number;
    autoGenerate: boolean;
    includedMetrics: string[];
    reportingSchedule: Array<{
      type: 'position' | 'weather' | 'fuel' | 'progress';
      interval: number;
      enabled: boolean;
    }>;
  };
  
  // Mid-voyage modifications
  modifications: Array<{
    id: string;
    timestamp: string;
    type: 'waypoint_added' | 'waypoint_deleted' | 'waypoint_unlocked' | 'route_replaced' | 'schedule_updated';
    description: string;
    data: any;
    appliedBy: string;
  }>;
  
  // Voyage progress tracking
  progress: {
    currentWaypointIndex: number;
    completedWaypoints: string[];
    skippedWaypoints: string[];
    estimatedCompletion: string;
    actualProgress: number; // percentage
    remainingDistance: number; // nautical miles
    remainingTime: number; // hours
  };
}

// Sample JSON structure
export const sampleVoyageJSON: VoyageConfiguration = {
  voyageId: "VYG-2024-001",
  vesselId: "IMO-1234567",
  voyageName: "Singapore to Rotterdam",
  status: "planning",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  
  masterIntendedRoute: {
    enabled: true,
    waypoints: [
      {
        id: "wp-001",
        waypointNumber: 1,
        latitude: 1.2966,
        longitude: 103.7764,
        locked: true,
        eta: "2024-01-20T08:00:00Z",
        speed: 12.5,
        heading: 285
      },
      {
        id: "wp-002",
        waypointNumber: 2,
        latitude: 8.5569,
        longitude: 76.8810,
        locked: true,
        eta: "2024-01-23T14:30:00Z",
        speed: 12.0,
        heading: 315
      },
      {
        id: "wp-003",
        waypointNumber: 3,
        latitude: 12.9716,
        longitude: 77.5946,
        locked: false,
        eta: "2024-01-25T09:15:00Z",
        speed: 11.8,
        heading: 330
      },
      {
        id: "wp-004",
        waypointNumber: 4,
        latitude: 25.2048,
        longitude: 55.2708,
        locked: true,
        eta: "2024-01-28T16:45:00Z",
        speed: 12.2,
        heading: 345
      },
      {
        id: "wp-005",
        waypointNumber: 5,
        latitude: 30.0444,
        longitude: 31.2357,
        locked: false,
        eta: "2024-01-30T12:20:00Z",
        speed: 11.5,
        heading: 310
      },
      {
        id: "wp-006",
        waypointNumber: 6,
        latitude: 51.9244,
        longitude: 4.4777,
        locked: true,
        eta: "2024-02-05T07:00:00Z",
        speed: 12.0,
        heading: 0
      }
    ],
    uploadedFile: {
      name: "singapore_rotterdam_route.rtz",
      type: "rtz",
      uploadedAt: "2024-01-15T10:00:00Z"
    }
  },
  
  vessel: {
    name: "MV Ocean Pioneer",
    imo: "IMO-1234567",
    type: "Container Ship",
    currentPosition: {
      latitude: 1.2966,
      longitude: 103.7764,
      timestamp: "2024-01-15T10:00:00Z"
    },
    characteristics: {
      length: 320,
      beam: 48,
      draft: 14.5,
      grossTonnage: 150000,
      deadweight: 180000,
      maxSpeed: 22,
      fuelCapacity: 5000
    }
  },
  
  routePlanning: {
    startPort: {
      name: "Port of Singapore",
      code: "SGSIN",
      coordinates: [103.7764, 1.2966]
    },
    endPort: {
      name: "Port of Rotterdam",
      code: "NLRTM",
      coordinates: [4.4777, 51.9244]
    },
    plannedDeparture: "2024-01-20T06:00:00Z",
    plannedArrival: "2024-02-05T08:00:00Z",
    alternativeRoutes: [
      {
        id: "alt-001",
        name: "Via Cape of Good Hope",
        waypoints: [],
        estimatedDuration: 25,
        estimatedFuelConsumption: 800,
        weatherRating: "good"
      },
      {
        id: "alt-002",
        name: "Direct Route",
        waypoints: [],
        estimatedDuration: 16,
        estimatedFuelConsumption: 650,
        weatherRating: "moderate"
      }
    ]
  },
  
  weatherConfig: {
    enabled: true,
    autoUpdate: true,
    updateInterval: 360,
    weatherSources: ["DTN", "MetOcean", "ECMWF"],
    alertThresholds: {
      windSpeed: 35,
      waveHeight: 6,
      visibility: 1000
    }
  },
  
  reporting: {
    intervalMinutes: 360,
    autoGenerate: true,
    includedMetrics: ["position", "speed", "heading", "fuel", "weather"],
    reportingSchedule: [
      {
        type: "position",
        interval: 60,
        enabled: true
      },
      {
        type: "weather",
        interval: 360,
        enabled: true
      },
      {
        type: "fuel",
        interval: 720,
        enabled: true
      },
      {
        type: "progress",
        interval: 360,
        enabled: true
      }
    ]
  },
  
  modifications: [],
  
  progress: {
    currentWaypointIndex: 0,
    completedWaypoints: [],
    skippedWaypoints: [],
    estimatedCompletion: "2024-02-05T08:00:00Z",
    actualProgress: 0,
    remainingDistance: 11500,
    remainingTime: 384
  }
};