import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MIRUploadModule from '@/components/VoyageCreation/MIRUploadModule';
import MapVisualizationModule from '@/components/VoyageCreation/MapVisualizationModule';
import { WaypointData } from '@/components/VoyageCreation/VoyageDataTable';
import { sampleVoyageJSON } from '@/components/VoyageCreation/VoyageJSON';

const CreateVoyage = () => {
  const navigate = useNavigate();
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [voyageName, setVoyageName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [mirEnabled, setMirEnabled] = useState(true);

  const handleWaypointsChange = (newWaypoints: WaypointData[]) => {
    setWaypoints(newWaypoints);
  };

  const handleMIRToggle = (enabled: boolean) => {
    setMirEnabled(enabled);
    if (!enabled) {
      setWaypoints([]);
    }
  };

  const handleCreateVoyage = () => {
    if (!voyageName.trim()) {
      toast.error('Please enter a voyage name');
      return;
    }
    
    if (!vesselName.trim()) {
      toast.error('Please enter a vessel name');
      return;
    }

    // Generate voyage configuration
    const voyageConfig = {
      ...sampleVoyageJSON,
      voyageName,
      vessel: {
        ...sampleVoyageJSON.vessel,
        name: vesselName
      },
      masterIntendedRoute: {
        enabled: mirEnabled,
        waypoints: waypoints,
        uploadedFile: waypoints.length > 0 ? {
          name: `${voyageName.replace(/\s+/g, '_')}_waypoints.json`,
          type: 'json' as const,
          uploadedAt: new Date().toISOString()
        } : undefined
      }
    };

    console.log('Generated Voyage Configuration:', JSON.stringify(voyageConfig, null, 2));
    toast.success('Voyage created successfully!');
    navigate('/routes');
  };

  const downloadSampleJSON = () => {
    const blob = new Blob([JSON.stringify(sampleVoyageJSON, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_voyage_configuration.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample JSON downloaded');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Voyage</h1>
        <p className="text-muted-foreground">
          Set up your comprehensive voyage route and configuration system
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="voyage-name">Voyage Name</Label>
          <Input
            id="voyage-name"
            placeholder="e.g., Singapore to Rotterdam"
            value={voyageName}
            onChange={(e) => setVoyageName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vessel-name">Vessel Name</Label>
          <Input
            id="vessel-name"
            placeholder="e.g., MV Ocean Pioneer"
            value={vesselName}
            onChange={(e) => setVesselName(e.target.value)}
          />
        </div>
      </div>

      {/* Mapbox Token Input */}
      <div className="mb-6 space-y-2">
        <Label htmlFor="mapbox-token">Mapbox Token (for map visualization)</Label>
        <Input
          id="mapbox-token"
          type="password"
          placeholder="Enter your Mapbox public token"
          value={mapboxToken}
          onChange={(e) => setMapboxToken(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Get your token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - MIR Upload */}
        <div className="space-y-6">
          <MIRUploadModule
            onWaypointsChange={handleWaypointsChange}
            onMIRToggle={handleMIRToggle}
          />
        </div>

        {/* Right Column - Map Visualization */}
        <div className="space-y-6">
          <MapVisualizationModule
            waypoints={waypoints}
            onWaypointsChange={handleWaypointsChange}
            mapboxToken={mapboxToken}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-between mt-8">
        <Button variant="outline" onClick={downloadSampleJSON}>
          Download Sample JSON
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/routes')}>
            Cancel
          </Button>
          <Button onClick={handleCreateVoyage}>
            Create Voyage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateVoyage;