/**
 * ROUTE HEADER COMPONENT
 * 
 * This component renders the header section of the route detail page containing:
 * - Navigation controls (back button)
 * - Action buttons (search, notifications, more options)
 * - Route information display (name, status, coordinates)
 * - Route metadata grid (ID, dates, distance, estimated time, speed)
 * - Completion status indicator for completed voyages
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Route } from '@/lib/vessel-data';

// Props interface defining the data and callbacks needed by the header
interface RouteHeaderProps {
  route: Route;                                    // Route data object
  routeId: string;                                // Route identifier for display
  voyageStatus: 'active' | 'completed';          // Current status of the voyage
  onModifyVoyage: () => void;                     // Callback for modify voyage action
  onCompleteVoyage: () => void;                   // Callback for complete voyage action
}

const RouteHeader: React.FC<RouteHeaderProps> = ({
  route,
  routeId,
  voyageStatus,
  onModifyVoyage,
  onCompleteVoyage
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0c1c3d] text-white p-4">
      {/* TOP NAVIGATION BAR - Back button and action buttons */}
      <div className="flex items-center justify-between mb-4">
        {/* Back navigation button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={() => navigate('/routes')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Action buttons - Search, Notifications, and More options */}
        <div className="flex items-center space-x-2">
          {/* Search functionality */}
          <Button variant="ghost" size="icon" className="text-white">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-white">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* More Options Dropdown - Contains voyage management actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {/* Always available: Modify voyage */}
              <DropdownMenuItem onClick={onModifyVoyage}>
                Modify Voyage
              </DropdownMenuItem>
              {/* Only show complete option for active voyages */}
              {voyageStatus === 'active' && (
                <DropdownMenuItem onClick={onCompleteVoyage}>
                  Complete Voyage
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* ROUTE TITLE AND STATUS SECTION */}
      <div>
        {/* Route name with status badge */}
        <h1 className="text-xl font-semibold flex items-center">
          {route?.name}
          {/* Status badge - Changes color based on voyage status */}
          <span className={`text-xs font-medium ml-2 px-2 py-0.5 rounded ${
            voyageStatus === 'completed' 
              ? 'bg-gray-500 text-white'      // Gray for completed voyages
              : 'bg-green-500 text-white'     // Green for active voyages
          }`}>
            {voyageStatus === 'completed' ? 'Completed' : route?.status}
          </span>
        </h1>
        
        {/* Current position coordinates and start port */}
        <div className="flex text-sm text-gray-300">
          <span>29° 52' 43.2" N</span>       {/* Latitude */}
          <span className="mx-2">•</span>     {/* Separator */}
          <span>{route?.startPort}</span>     {/* Start port name */}
        </div>
        <div className="text-sm text-gray-300">
          <span>121° 08' 29.5" E</span>       {/* Longitude */}
        </div>
      </div>

      {/* ROUTE METADATA GRID - 2 rows x 3 columns layout */}
      <div className="grid grid-cols-3 gap-6 mt-4">
        {/* First Row */}
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Route ID</p>
          <p className="font-bold">#{routeId}</p>
        </div>
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Start Date</p>
          <p className="font-bold">{new Date(route?.departureDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Time</p>
          <p className="font-bold">07:40 UTC</p>               {/* Static time - could be dynamic */}
        </div>

        {/* Second Row */}
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Distance</p>
          <p className="font-bold">{route?.distance} nm</p>    {/* Nautical miles */}
        </div>
        <div className="border-r border-gray-700 pr-4">
          <p className="text-xs text-gray-400">Est. Time</p>
          <p className="font-bold">{route?.estimatedTime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Planned Speed</p>
          <p className="font-bold">10kt - 12kt</p>             {/* Static speed range */}
        </div>
      </div>

      {/* COMPLETION STATUS BANNER - Only shown for completed voyages */}
      {voyageStatus === 'completed' && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center text-gray-300">
            <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
            <span className="text-sm">Voyage completed successfully</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteHeader;