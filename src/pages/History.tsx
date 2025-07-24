
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  generateMockVessels, 
  generateMockHistory,
  VesselEvent,
  Vessel 
} from '@/lib/vessel-data';
import { Search, History as HistoryIcon, AlertTriangle, MapPin, Navigation, Calendar } from 'lucide-react';

const History = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [events, setEvents] = useState<VesselEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<VesselEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVessel, setFilterVessel] = useState<string>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');

  useEffect(() => {
    // Generate mock vessel and history data
    const mockVessels = generateMockVessels();
    const mockEvents = generateMockHistory(mockVessels, 50);
    
    setVessels(mockVessels);
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  useEffect(() => {
    // Apply filters when search term or filter changes
    let filtered = events;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.description.toLowerCase().includes(term) || 
        event.location.toLowerCase().includes(term) ||
        event.vesselId.toLowerCase().includes(term)
      );
    }
    
    // Apply vessel filter
    if (filterVessel !== 'all') {
      filtered = filtered.filter(event => event.vesselId === filterVessel);
    }
    
    // Apply event type filter
    if (filterEventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filterEventType);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, filterVessel, filterEventType, events]);
  
  // Format date to a more readable format
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get vessel name by ID
  const getVesselName = (id: string): string => {
    const vessel = vessels.find(v => v.id === id);
    return vessel ? vessel.name : 'Unknown Vessel';
  };

  // Get vessel type by ID - updated to handle 'circle' type
  const getVesselType = (id: string): 'green' | 'orange' | 'circle' | 'unknown' => {
    const vessel = vessels.find(v => v.id === id);
    return vessel ? vessel.type : 'unknown';
  };

  // Get icon for event type
  const getEventIcon = (eventType: VesselEvent['eventType']) => {
    switch (eventType) {
      case 'departure':
        return <Navigation className="h-4 w-4" />;
      case 'arrival':
        return <MapPin className="h-4 w-4" />;
      case 'position':
        return <MapPin className="h-4 w-4" />;
      case 'status':
        return <HistoryIcon className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <HistoryIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Vessel History</h1>
        <p className="text-muted-foreground">
          View historical events and activities for all vessels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Search Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filter by Vessel</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterVessel} onValueChange={setFilterVessel}>
              <SelectTrigger>
                <SelectValue placeholder="Select vessel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vessels</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name} ({vessel.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filter by Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="departure">Departure</SelectItem>
                <SelectItem value="arrival">Arrival</SelectItem>
                <SelectItem value="position">Position Update</SelectItem>
                <SelectItem value="status">Status Change</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div 
              key={event.id} 
              className={`border rounded-lg p-4 hover:bg-muted/30 transition-colors ${
                event.eventType === 'alert' ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${
                  event.eventType === 'alert' ? 'bg-red-100 text-red-800' : 
                  event.eventType === 'departure' ? 'bg-blue-100 text-blue-800' :
                  event.eventType === 'arrival' ? 'bg-green-100 text-green-800' :
                  event.eventType === 'status' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                } mr-4`}>
                  {getEventIcon(event.eventType)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      {event.eventType === 'alert' && 
                        <AlertTriangle className="inline h-4 w-4 text-red-600 mr-1" />
                      }
                      {event.description}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <span className={`h-3 w-3 rounded-full bg-vessel-${getVesselType(event.vesselId)} mr-2`}></span>
                    <span className="mr-4">{getVesselName(event.vesselId)} ({event.vesselId})</span>
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="mt-2 text-xs flex justify-between">
                    <span className="text-muted-foreground">
                      ID: {event.id}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <HistoryIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
