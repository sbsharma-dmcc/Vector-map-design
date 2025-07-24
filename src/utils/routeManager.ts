
import mapboxgl from 'mapbox-gl';

export const addRoutesToMap = (
  map: mapboxgl.Map,
  baseRoute: [number, number][],
  weatherRoute: [number, number][]
) => {
  // Add base route source and layer
  map.addSource('base-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: baseRoute
      }
    }
  });
  
  map.addLayer({
    id: 'base-route-line',
    type: 'line',
    source: 'base-route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#000',
      'line-width': 3,
      'line-dasharray': [1, 0]
    }
  });
  
  // Add weather route source and layer
  map.addSource('weather-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: weatherRoute
      }
    }
  });
  
  map.addLayer({
    id: 'weather-route-line',
    type: 'line',
    source: 'weather-route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#4ade80',
      'line-width': 3,
      'line-dasharray': [1, 0]
    }
  });
  
  // Add start and end markers
  if (baseRoute.length > 0) {
    // Start marker (S)
    const startEl = document.createElement('div');
    startEl.className = 'start-marker';
    startEl.style.width = '30px';
    startEl.style.height = '30px';
    startEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="%234ade80" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">S</text></svg>')`;
    
    new mapboxgl.Marker(startEl)
      .setLngLat([baseRoute[0][0], baseRoute[0][1]])
      .addTo(map);
    
    // End marker (destination)
    const endEl = document.createElement('div');
    endEl.className = 'end-marker';
    endEl.style.width = '30px';
    endEl.style.height = '30px';
    endEl.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12px" font-family="Arial">D</text></svg>')`;
    
    new mapboxgl.Marker(endEl)
      .setLngLat([baseRoute[baseRoute.length - 1][0], baseRoute[baseRoute.length - 1][1]])
      .addTo(map);
  }
  
  // Set initial bounds to fit routes
  const coordinates = [...baseRoute, ...weatherRoute];
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord as mapboxgl.LngLatLike);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
  
  map.fitBounds(bounds, {
    padding: 50
  });
};

export const updateRouteVisibility = (
  map: mapboxgl.Map,
  activeRouteType: 'base' | 'weather'
) => {
  try {
    if (map.getLayer('base-route-line') && map.getLayer('weather-route-line')) {
      if (activeRouteType === 'base') {
        map.setLayoutProperty('base-route-line', 'visibility', 'visible');
        map.setLayoutProperty('weather-route-line', 'visibility', 'none');
      } else {
        map.setLayoutProperty('base-route-line', 'visibility', 'none');
        map.setLayoutProperty('weather-route-line', 'visibility', 'visible');
      }
    }
  } catch (error) {
    console.error("Error updating route visibility:", error);
  }
};
