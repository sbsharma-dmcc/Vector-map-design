
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderPlus, Map, Plus, Settings, Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MapConfigurationView from '@/components/MapConfigurationView';

interface MapConfiguration {
  id: string;
  name: string;
  weatherConfig: Record<string, unknown>;
  mapSettings: Record<string, unknown>;
  createdAt: string;
  lastModified: string;
}

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  maps: MapConfiguration[];
}

const Maps = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapConfiguration | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newMapName, setNewMapName] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateMapOpen, setIsCreateMapOpen] = useState(false);
  const [isMapViewOpen, setIsMapViewOpen] = useState(false);
  const { toast } = useToast();

  // Load folders from localStorage on component mount
  useEffect(() => {
    const savedFolders = localStorage.getItem('mapFolders');
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    }
  }, []);

  // Save folders to localStorage whenever folders change
  useEffect(() => {
    localStorage.setItem('mapFolders', JSON.stringify(folders));
  }, [folders]);

  const createFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder Name Required",
        description: "Please enter a name for your folder",
        variant: "destructive"
      });
      return;
    }

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      createdAt: new Date().toISOString(),
      maps: []
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsCreateFolderOpen(false);

    toast({
      title: "Folder Created",
      description: `Folder "${newFolder.name}" has been created`
    });
  };

  const deleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
      
      toast({
        title: "Folder Deleted",
        description: `Folder "${folder.name}" has been deleted`
      });
    }
  };

  const createMap = () => {
    if (!selectedFolder || !newMapName.trim()) {
      toast({
        title: "Map Name Required",
        description: "Please enter a name for your map",
        variant: "destructive"
      });
      return;
    }

    const newMap: MapConfiguration = {
      id: Date.now().toString(),
      name: newMapName.trim(),
      weatherConfig: {},
      mapSettings: {
        center: [83.167, 6.887],
        zoom: 4,
        style: 'mapbox://styles/geoserve/cmb8z5ztq00rw01qxauh6gv66'
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setFolders(prev => prev.map(folder => 
      folder.id === selectedFolder.id 
        ? { ...folder, maps: [...folder.maps, newMap] }
        : folder
    ));

    setNewMapName('');
    setIsCreateMapOpen(false);

    toast({
      title: "Map Created",
      description: `Map "${newMap.name}" has been created in "${selectedFolder.name}"`
    });
  };

  const deleteMap = (mapId: string) => {
    if (!selectedFolder) return;

    const map = selectedFolder.maps.find(m => m.id === mapId);
    if (map) {
      setFolders(prev => prev.map(folder => 
        folder.id === selectedFolder.id 
          ? { ...folder, maps: folder.maps.filter(m => m.id !== mapId) }
          : folder
      ));
      
      toast({
        title: "Map Deleted",
        description: `Map "${map.name}" has been deleted`
      });
    }
  };

  const openMapConfiguration = (map: MapConfiguration) => {
    setSelectedMap(map);
    setIsMapViewOpen(true);
  };

  const saveMapConfiguration = (mapId: string, config: any) => {
    if (!selectedFolder) return;

    setFolders(prev => prev.map(folder => 
      folder.id === selectedFolder.id 
        ? { 
            ...folder, 
            maps: folder.maps.map(map => 
              map.id === mapId 
                ? { ...map, weatherConfig: config, lastModified: new Date().toISOString() }
                : map
            )
          }
        : folder
    ));

    toast({
      title: "Map Configuration Saved",
      description: "Your map configuration has been saved successfully"
    });
  };

  const generateShareableUrl = (folderId: string, mapId: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/maps/shared?folder=${folderId}&map=${mapId}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "URL Copied",
        description: "Shareable URL has been copied to clipboard"
      });
    }).catch(() => {
      toast({
        title: "URL Generated",
        description: shareUrl,
        variant: "default"
      });
    });
  };

  const renderFolderView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Map Folders</h1>
        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogTrigger asChild>
            <Button className="bg-vessel-green hover:bg-vessel-green/90">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={createFolder} className="flex-1">
                  Create Folder
                </Button>
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Card key={folder.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-vessel-green" />
                  {folder.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {folder.maps.length} maps • Created {new Date(folder.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setSelectedFolder(folder)}
                className="w-full"
                variant="outline"
              >
                Open Folder
              </Button>
            </CardContent>
          </Card>
        ))}

        {folders.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
            <p className="text-gray-500 mb-4">Create your first folder to start organizing your maps</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMapsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => setSelectedFolder(null)} className="mb-2">
            ← Back to Folders
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedFolder?.name}</h1>
        </div>
        <Dialog open={isCreateMapOpen} onOpenChange={setIsCreateMapOpen}>
          <DialogTrigger asChild>
            <Button className="bg-vessel-green hover:bg-vessel-green/90">
              <Map className="h-4 w-4 mr-2" />
              Create Map
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Map</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Map name"
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={createMap} className="flex-1">
                  Create Map
                </Button>
                <Button variant="outline" onClick={() => setIsCreateMapOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedFolder?.maps.map((map) => (
          <Card key={map.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-600" />
                  {map.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateShareableUrl(selectedFolder.id, map.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMap(map.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Last modified {new Date(map.lastModified).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => openMapConfiguration(map)}
                className="w-full"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Map
              </Button>
            </CardContent>
          </Card>
        ))}

        {selectedFolder?.maps.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No maps yet</h3>
            <p className="text-gray-500 mb-4">Create your first map in this folder</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {!selectedFolder ? renderFolderView() : renderMapsView()}
      
      {/* Map Configuration Dialog */}
      <Dialog open={isMapViewOpen} onOpenChange={setIsMapViewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Configure Map: {selectedMap?.name}</DialogTitle>
          </DialogHeader>
          {selectedMap && selectedFolder && (
            <MapConfigurationView
              map={selectedMap}
              folder={selectedFolder}
              onSave={(config) => saveMapConfiguration(selectedMap.id, config)}
              onClose={() => setIsMapViewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maps;
