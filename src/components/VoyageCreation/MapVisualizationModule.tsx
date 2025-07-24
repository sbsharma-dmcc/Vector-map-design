import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { WaypointData } from './VoyageDataTable';
import { toast } from 'sonner';

interface MapVisualizationModuleProps {
  waypoints: WaypointData[];
  onWaypointsChange: (waypoints: WaypointData[]) => void;
  mapboxToken?: string;
}

const MapVisualizationModule: React.FC<MapVisualizationModuleProps> = ({
  waypoints,
  onWaypointsChange,
  mapboxToken
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0],
      zoom: 2
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || waypoints.length === 0) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Remove existing route layers
    if (map.current.getLayer('route-line')) {
      map.current.removeLayer('route-line');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Add route line
    const coordinates = waypoints.map(wp => [wp.longitude, wp.latitude]);
    
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#4ade80',
        'line-width': 3
      }
    });

    // Add waypoint markers
    waypoints.forEach((waypoint, index) => {
      const el = document.createElement('div');
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      
      const isStart = index === 0;
      const isEnd = index === waypoints.length - 1;
      
      let markerColor = '#4ade80'; // green for regular waypoints
      let markerText = waypoint.waypointNumber.toString();
      
      if (isStart) {
        markerColor = '#22c55e';
        markerText = 'S';
      } else if (isEnd) {
        markerColor = '#ef4444';
        markerText = 'D';
      }

      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${markerColor};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${markerText}
          ${waypoint.locked ? `
            <div style="
              position: absolute;
              top: -4px;
              right: -4px;
              width: 12px;
              height: 12px;
              background: #fbbf24;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                <path d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10Z"/>
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
          ` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([waypoint.longitude, waypoint.latitude])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setLngLat([waypoint.longitude, waypoint.latitude])
          .setHTML(`
            <div style="padding: 8px;">
              <div><strong>Waypoint ${waypoint.waypointNumber}</strong></div>
              <div>Lat: ${waypoint.latitude.toFixed(4)}</div>
              <div>Lng: ${waypoint.longitude.toFixed(4)}</div>
              <div style="margin-top: 8px; display: flex; gap: 4px;">
                <button id="toggle-lock-${waypoint.id}" style="
                  background: ${waypoint.locked ? '#ef4444' : '#22c55e'};
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                ">
                  ${waypoint.locked ? 'Unlock' : 'Lock'}
                </button>
                <button id="delete-${waypoint.id}" style="
                  background: #dc2626;
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                ">
                  Delete
                </button>
              </div>
            </div>
          `)
          .addTo(map.current!);

        // Add event listeners for popup buttons
        setTimeout(() => {
          const toggleBtn = document.getElementById(`toggle-lock-${waypoint.id}`);
          const deleteBtn = document.getElementById(`delete-${waypoint.id}`);

          toggleBtn?.addEventListener('click', () => {
            toggleWaypointLock(waypoint.id);
            popup.remove();
          });

          deleteBtn?.addEventListener('click', () => {
            deleteWaypoint(waypoint.id);
            popup.remove();
          });
        }, 100);
      });

      markers.current[waypoint.id] = marker;
    });

    // Fit map to waypoints
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord as mapboxgl.LngLatLike);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [waypoints]);

  const toggleWaypointLock = (id: string) => {
    const updatedWaypoints = waypoints.map(wp =>
      wp.id === id ? { ...wp, locked: !wp.locked } : wp
    );
    onWaypointsChange(updatedWaypoints);
    toast.success('Waypoint lock status updated');
  };

  const deleteWaypoint = (id: string) => {
    const updatedWaypoints = waypoints.filter(wp => wp.id !== id);
    onWaypointsChange(updatedWaypoints);
    toast.success('Waypoint deleted from map');
  };

  if (!mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            Map Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Please provide a Mapbox token to display the map visualization.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          Map Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-96 rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
          
          {waypoints.length > 0 && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Click on waypoints to lock/unlock or delete them</p>
              <p>• Locked waypoints show a lock icon and cannot be modified during voyage</p>
              <p>• Green markers are regular waypoints, 'S' is start, 'D' is destination</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapVisualizationModule;