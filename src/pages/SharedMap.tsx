
import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { defaultMapToken } from '@/utils/mapConstants';

const SharedMap = () => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folder');
  const mapId = searchParams.get('map');
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapData, setMapData] = useState<Record<string, any> | null>(null);
  const [folderData, setFolderData] = useState<Record<string, any> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!folderId || !mapId) return;

    // Load map data from localStorage
    const savedFolders = localStorage.getItem('mapFolders');
    if (savedFolders) {
      try {
        const folders: Record<string, any>[] = JSON.parse(savedFolders);
        const folder = folders.find((f) => f.id === folderId);
        if (folder) {
          const map = folder.maps.find((m: Record<string, any>) => m.id === mapId);
          if (map) {
            setMapData(map);
            setFolderData(folder);
          }
        }
      } catch (error) {
        console.error('Error loading shared map:', error);
      }
    }
  }, [folderId, mapId]);

  useEffect(() => {
    if (!mapContainer.current || !mapData) return;

    // Initialize map
    mapboxgl.accessToken = defaultMapToken;
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapData.mapSettings?.style || 'mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7',
      center: mapData.mapSettings?.center || [83.167, 6.887],
      zoom: mapData.mapSettings?.zoom || 4,
      attributionControl: false
    });

    // Add navigation controls
    mapRef.current.addControl(
      new mapboxgl.NavigationControl(),
      'bottom-right'
    );

    // Apply weather configuration if available
    if (mapData.weatherConfig) {
      mapRef.current.on('load', () => {
        // Apply weather layers based on saved configuration
        console.log('Applying weather configuration:', mapData.weatherConfig);
        // Weather layer application logic would go here
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [mapData]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "URL Copied",
        description: "Map URL has been copied to clipboard"
      });
    });
  };

  if (!mapData || !folderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Map Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              The requested map could not be found. It may have been deleted or moved.
            </p>
            <Link to="/maps">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Maps
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mapData.name}</h1>
            <p className="text-gray-600">From folder: {folderData.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCopyUrl} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Link to="/maps">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                My Maps
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Map Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-1">{mapData.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            Created: {new Date(mapData.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Last modified: {new Date(mapData.lastModified).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedMap;
