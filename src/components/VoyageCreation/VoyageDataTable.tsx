import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export interface WaypointData {
  id: string;
  waypointNumber: number;
  latitude: number;
  longitude: number;
  locked: boolean;
  hasIssues?: boolean;
  issues?: string[];
}

interface VoyageDataTableProps {
  data: WaypointData[];
  onDataChange: (data: WaypointData[]) => void;
  onDownload: () => void;
  onReUpload: () => void;
}

const VoyageDataTable: React.FC<VoyageDataTableProps> = ({
  data,
  onDataChange,
  onDownload,
  onReUpload
}) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCellEdit = (id: string, field: string, currentValue: string | number) => {
    setEditingCell({ id, field });
    setEditValue(currentValue.toString());
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const updatedData = data.map(item => {
      if (item.id === editingCell.id) {
        const newItem = { ...item };
        
        // Validate the input
        if (editingCell.field === 'waypointNumber') {
          const num = parseInt(editValue);
          if (isNaN(num)) {
            toast.error('Waypoint number must be numeric');
            return item;
          }
          newItem.waypointNumber = num;
        } else if (editingCell.field === 'latitude' || editingCell.field === 'longitude') {
          const num = parseFloat(editValue);
          if (isNaN(num)) {
            toast.error('Coordinates must be in DD format (e.g., 33.5000)');
            return item;
          }
          if (editingCell.field === 'latitude' && (num < -90 || num > 90)) {
            toast.error('Latitude must be between -90 and 90');
            return item;
          }
          if (editingCell.field === 'longitude' && (num < -180 || num > 180)) {
            toast.error('Longitude must be between -180 and 180');
            return item;
          }
          newItem[editingCell.field] = num;
        }
        
        // Clear issues if data was corrected
        if (newItem.hasIssues) {
          newItem.hasIssues = false;
          newItem.issues = [];
        }
        
        return newItem;
      }
      return item;
    });

    onDataChange(updatedData);
    setEditingCell(null);
    setEditValue('');
  };

  const toggleLock = (id: string) => {
    const updatedData = data.map(item =>
      item.id === id ? { ...item, locked: !item.locked } : item
    );
    onDataChange(updatedData);
  };

  const deleteWaypoint = (id: string) => {
    const updatedData = data.filter(item => item.id !== id);
    onDataChange(updatedData);
    toast.success('Waypoint deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={onReUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Re-upload
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waypoint #</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((waypoint) => (
              <TableRow 
                key={waypoint.id}
                className={waypoint.hasIssues ? 'bg-destructive/10' : ''}
              >
                <TableCell>
                  {editingCell?.id === waypoint.id && editingCell?.field === 'waypointNumber' ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                      className="w-20"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-muted p-1 rounded"
                      onClick={() => handleCellEdit(waypoint.id, 'waypointNumber', waypoint.waypointNumber)}
                    >
                      {waypoint.waypointNumber}
                    </span>
                  )}
                </TableCell>
                
                <TableCell>
                  {editingCell?.id === waypoint.id && editingCell?.field === 'latitude' ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                      className="w-24"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-muted p-1 rounded"
                      onClick={() => handleCellEdit(waypoint.id, 'latitude', waypoint.latitude)}
                    >
                      {waypoint.latitude.toFixed(4)}
                    </span>
                  )}
                </TableCell>
                
                <TableCell>
                  {editingCell?.id === waypoint.id && editingCell?.field === 'longitude' ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                      className="w-24"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-muted p-1 rounded"
                      onClick={() => handleCellEdit(waypoint.id, 'longitude', waypoint.longitude)}
                    >
                      {waypoint.longitude.toFixed(4)}
                    </span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {waypoint.locked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {waypoint.locked ? 'Locked' : 'Unlocked'}
                    </span>
                    {waypoint.hasIssues && (
                      <span className="text-xs text-destructive">
                        Issues detected
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLock(waypoint.id)}
                    >
                      {waypoint.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWaypoint(waypoint.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.some(item => item.hasIssues) && (
        <div className="text-sm text-destructive">
          ⚠️ Some waypoints have validation issues. Click on cells to edit them.
        </div>
      )}
    </div>
  );
};

export default VoyageDataTable;