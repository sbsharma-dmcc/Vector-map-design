import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import VoyageDataTable, { WaypointData } from './VoyageDataTable';

interface MIRUploadModuleProps {
  onWaypointsChange: (waypoints: WaypointData[]) => void;
  onMIRToggle: (enabled: boolean) => void;
}

const MIRUploadModule: React.FC<MIRUploadModuleProps> = ({
  onWaypointsChange,
  onMIRToggle
}) => {
  const [uploadMIR, setUploadMIR] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [jsonData, setJsonData] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [waypoints, setWaypoints] = useState<WaypointData[]>([]);
  const [showTable, setShowTable] = useState(false);

  const handleMIRToggle = (enabled: boolean) => {
    setUploadMIR(enabled);
    onMIRToggle(enabled);
    if (!enabled) {
      setWaypoints([]);
      onWaypointsChange([]);
      setShowTable(false);
    }
  };

  const validateWaypoint = (waypoint: any): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    // Check waypoint number
    if (!waypoint.waypointNumber || isNaN(Number(waypoint.waypointNumber))) {
      issues.push('Waypoint number must be numeric');
    }
    
    // Check latitude (DD format)
    if (!waypoint.latitude || isNaN(Number(waypoint.latitude))) {
      issues.push('Latitude must be in DD format (e.g., 33.5000)');
    } else {
      const lat = Number(waypoint.latitude);
      if (lat < -90 || lat > 90) {
        issues.push('Latitude must be between -90 and 90');
      }
    }
    
    // Check longitude (DD format)
    if (!waypoint.longitude || isNaN(Number(waypoint.longitude))) {
      issues.push('Longitude must be in DD format (e.g., 33.5000)');
    } else {
      const lng = Number(waypoint.longitude);
      if (lng < -180 || lng > 180) {
        issues.push('Longitude must be between -180 and 180');
      }
    }
    
    return { isValid: issues.length === 0, issues };
  };

  const parseRTZFile = (content: string): WaypointData[] => {
    // Simple RTZ parsing - in real implementation, use proper XML parser
    const waypoints: WaypointData[] = [];
    const waypointMatches = content.match(/<waypoint[^>]*>/g);
    
    waypointMatches?.forEach((match, index) => {
      const latMatch = match.match(/lat="([^"]+)"/);
      const lonMatch = match.match(/lon="([^"]+)"/);
      
      if (latMatch && lonMatch) {
        const waypoint = {
          waypointNumber: index + 1,
          latitude: parseFloat(latMatch[1]),
          longitude: parseFloat(lonMatch[1])
        };
        
        const validation = validateWaypoint(waypoint);
        waypoints.push({
          id: `waypoint-${Date.now()}-${index}`,
          ...waypoint,
          locked: true, // Default locked
          hasIssues: !validation.isValid,
          issues: validation.issues
        });
      }
    });
    
    return waypoints;
  };

  const parseCSVFile = (content: string): WaypointData[] => {
    const lines = content.split('\n');
    const waypoints: WaypointData[] = [];
    
    lines.forEach((line, index) => {
      if (index === 0 || !line.trim()) return; // Skip header or empty lines
      
      const [waypointNum, lat, lng] = line.split(',').map(s => s.trim());
      
      if (waypointNum && lat && lng) {
        const waypoint = {
          waypointNumber: parseInt(waypointNum),
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        };
        
        const validation = validateWaypoint(waypoint);
        waypoints.push({
          id: `waypoint-${Date.now()}-${index}`,
          ...waypoint,
          locked: true, // Default locked
          hasIssues: !validation.isValid,
          issues: validation.issues
        });
      }
    });
    
    return waypoints;
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.name.endsWith('.rtz') || file.name.endsWith('.csv')
    );

    if (validFiles.length === 0) {
      toast.error('Please upload .rtz or .csv files only');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        let parsedWaypoints: WaypointData[] = [];
        
        try {
          if (file.name.endsWith('.rtz')) {
            parsedWaypoints = parseRTZFile(content);
          } else if (file.name.endsWith('.csv')) {
            parsedWaypoints = parseCSVFile(content);
          }
          
          if (parsedWaypoints.length > 0) {
            setWaypoints(parsedWaypoints);
            onWaypointsChange(parsedWaypoints);
            setShowTable(true);
            
            const issueCount = parsedWaypoints.filter(w => w.hasIssues).length;
            if (issueCount > 0) {
              toast.warning(`${file.name} uploaded with ${issueCount} validation issues`);
            } else {
              toast.success(`${file.name} uploaded successfully`);
            }
          } else {
            toast.error('No valid waypoints found in file');
          }
        } catch (error) {
          toast.error('Error parsing file. Please check format.');
        }
      };
      reader.readAsText(file);
    });
  };

  const handleJsonSubmit = () => {
    if (!jsonData.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    try {
      const data = JSON.parse(jsonData);
      let parsedWaypoints: WaypointData[] = [];
      
      if (Array.isArray(data.waypoints)) {
        parsedWaypoints = data.waypoints.map((wp: any, index: number) => {
          const validation = validateWaypoint(wp);
          return {
            id: `waypoint-${Date.now()}-${index}`,
            waypointNumber: wp.waypointNumber || index + 1,
            latitude: wp.latitude,
            longitude: wp.longitude,
            locked: wp.locked !== undefined ? wp.locked : true,
            hasIssues: !validation.isValid,
            issues: validation.issues
          };
        });
      }
      
      if (parsedWaypoints.length > 0) {
        setWaypoints(parsedWaypoints);
        onWaypointsChange(parsedWaypoints);
        setShowTable(true);
        toast.success('JSON data processed successfully');
      } else {
        toast.error('No valid waypoints found in JSON');
      }
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleWaypointsChange = (updatedWaypoints: WaypointData[]) => {
    setWaypoints(updatedWaypoints);
    onWaypointsChange(updatedWaypoints);
  };

  const handleDownload = () => {
    const csvContent = [
      'Waypoint Number,Latitude,Longitude,Locked',
      ...waypoints.map(wp => `${wp.waypointNumber},${wp.latitude},${wp.longitude},${wp.locked}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waypoints.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReUpload = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          Master Intended Route (MIR)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-base font-medium">
            Would you like to upload Master Intended Route (MIR)?
          </label>
          <Switch
            checked={uploadMIR}
            onCheckedChange={handleMIRToggle}
          />
        </div>

        {uploadMIR && (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="json">Paste JSON</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const files = Array.from(e.dataTransfer.files);
                    handleFiles(files);
                  }}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">
                      Drag and drop your RTZ or CSV file here, or
                    </p>
                    <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                      Browse Files
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".rtz,.csv"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        handleFiles(files);
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Supports .rtz and .csv formats
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <Textarea
                  placeholder="Paste your JSON route data here..."
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="min-h-32"
                />
                <Button onClick={handleJsonSubmit} className="w-full">
                  Process JSON
                </Button>
              </TabsContent>
            </Tabs>
            
            {showTable && waypoints.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <h4 className="font-medium">Uploaded Waypoints</h4>
                </div>
                <VoyageDataTable
                  data={waypoints}
                  onDataChange={handleWaypointsChange}
                  onDownload={handleDownload}
                  onReUpload={handleReUpload}
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Uploaded waypoints will be locked by default.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MIRUploadModule;