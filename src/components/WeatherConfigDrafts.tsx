
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Trash2, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherConfig {
  wind: Record<string, unknown>;
  pressure: Record<string, unknown>;
  swell: Record<string, unknown>;
  symbol: Record<string, unknown>;
  current: Record<string, unknown>;
  waves: Record<string, unknown>;
}

interface ConfigDraft {
  id: string;
  name: string;
  config: WeatherConfig;
  createdAt: string;
  description?: string;
}

interface WeatherConfigDraftsProps {
  currentConfig?: WeatherConfig;
  onLoadConfig?: (config: WeatherConfig) => void;
}

const WeatherConfigDrafts: React.FC<WeatherConfigDraftsProps> = ({
  currentConfig,
  onLoadConfig
}) => {
  const [drafts, setDrafts] = useState<ConfigDraft[]>([]);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<string>('');
  const { toast } = useToast();

  // Default config for when none is provided
  const defaultConfig: WeatherConfig = {
    wind: {},
    pressure: {},
    swell: {},
    symbol: {},
    current:{},
    waves:{}
  };

  // Use provided config or default
  const configToSave = currentConfig || defaultConfig;

  // Load drafts from localStorage on component mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('weatherConfigDrafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
  }, []);

  // Save drafts to localStorage whenever drafts change
  useEffect(() => {
    localStorage.setItem('weatherConfigDrafts', JSON.stringify(drafts));
  }, [drafts]);

  const saveDraft = () => {
    if (!draftName.trim()) {
      toast({
        title: "Draft Name Required",
        description: "Please enter a name for your draft",
        variant: "destructive"
      });
      return;
    }

    const newDraft: ConfigDraft = {
      id: Date.now().toString(),
      name: draftName.trim(),
      description: draftDescription.trim() || undefined,
      config: JSON.parse(JSON.stringify(configToSave)), // Deep copy
      createdAt: new Date().toISOString()
    };

    setDrafts(prev => [...prev, newDraft]);
    setDraftName('');
    setDraftDescription('');

    toast({
      title: "Draft Saved",
      description: `Weather configuration "${newDraft.name}" has been saved`
    });
  };

  const loadDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      if (onLoadConfig) {
        onLoadConfig(draft.config);
      }
      setSelectedDraft(draftId);
      
      toast({
        title: "Draft Loaded",
        description: `Weather configuration "${draft.name}" has been loaded`
      });
    }
  };

  const deleteDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      if (selectedDraft === draftId) {
        setSelectedDraft('');
      }
      
      toast({
        title: "Draft Deleted",
        description: `Weather configuration "${draft.name}" has been deleted`
      });
    }
  };

  const exportDrafts = () => {
    const dataStr = JSON.stringify(drafts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-config-drafts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Drafts Exported",
      description: "Your weather configuration drafts have been exported"
    });
  };

  const importDrafts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedDrafts = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedDrafts)) {
          setDrafts(prev => [...prev, ...importedDrafts]);
          toast({
            title: "Drafts Imported",
            description: `${importedDrafts.length} weather configuration drafts have been imported`
          });
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import drafts. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-4 p-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Configuration Drafts</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportDrafts}
            disabled={drafts.length === 0}
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={importDrafts}
                className="hidden"
              />
              <Upload className="h-3 w-3" />
            </label>
          </Button>
        </div>
      </div>

      {/* Save New Draft */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-700">Save Current Configuration</Label>
        <Input
          placeholder="Draft name"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="text-xs"
        />
        <Input
          placeholder="Description (optional)"
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
          className="text-xs"
        />
        <Button onClick={saveDraft} size="sm" className="w-full">
          <Save className="h-3 w-3 mr-1" />
          Save Draft
        </Button>
      </div>

      {/* Load Existing Drafts */}
      {drafts.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Load Saved Configuration</Label>
          <Select value={selectedDraft} onValueChange={loadDraft}>
            <SelectTrigger className="w-full text-xs">
              <SelectValue placeholder="Select a draft to load" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {drafts.map((draft) => (
                <SelectItem key={draft.id} value={draft.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{draft.name}</span>
                    {draft.description && (
                      <span className="text-xs text-gray-500">{draft.description}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Manage Drafts */}
      {drafts.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Manage Drafts ({drafts.length})</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{draft.name}</div>
                  <div className="text-gray-500 text-xs">
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteDraft(draft.id)}
                  className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherConfigDrafts;
