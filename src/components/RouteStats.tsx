/**
 * ROUTE STATS COMPONENT
 * 
 * This component displays route statistics and comparison data including:
 * - Date/time information for departure and arrival
 * - Comparison table between base route and weather-optimized route
 * - Cost analysis (fuel, hire, total estimated costs)
 * - Link to more detailed information
 * 
 * The stats show both the original planned values and optimized values
 * with color coding to indicate improvements (green) or increases (red).
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RouteStats: React.FC = () => {
  return (
    <div className="p-4">
      {/* DATE/TIME CARDS - Departure and arrival information */}
      <div className="grid grid-cols-2 gap-4">
        {/* Departure card */}
        <div className="bg-white p-4 rounded">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500">21st May 25</p>      {/* Departure date */}
            <p className="font-medium">11:50 UTC</p>                  {/* Departure time */}
          </div>
        </div>
        
        {/* Arrival card - Green color indicates this is the optimized/improved time */}
        <div className="bg-white p-4 rounded">
          <div className="flex flex-col items-center">
            <p className="text-sm text-green-500">21st May 25</p>     {/* Arrival date */}
            <p className="font-medium text-green-500">08:49 UTC</p>   {/* Arrival time */}
          </div>
        </div>
      </div>
      
      {/* COMPARISON TABLE - Base route vs Weather-optimized route */}
      <div className="mt-4">
        <div className="bg-white rounded">
          {/* Total Distance Row - Red indicates increase in distance */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Distance</p>
              <p className="font-medium">1,342 nm</p>              {/* Base route distance */}
            </div>
            <div className="p-4 flex">
              <p className="font-medium text-red-500">1,351 nm</p> {/* Weather route (longer) */}
            </div>
          </div>
          
          {/* Fuel Consumption Row - Green indicates fuel savings */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Consumption</p>
              <p className="font-medium">154 mt</p>               {/* Base consumption */}
            </div>
            <div className="p-4">
              <p className="font-medium text-green-500">151 mt</p> {/* Weather route (less fuel) */}
            </div>
          </div>
          
          {/* Fuel Cost Row - Currently showing $0 (placeholder) */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Fuel Cost</p>
              <p className="font-medium">$0</p>                   {/* Base fuel cost */}
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>                   {/* Weather route fuel cost */}
            </div>
          </div>
          
          {/* Hire Cost Row - Vessel hire/charter costs */}
          <div className="grid grid-cols-2 border-b">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Hire Cost</p>
              <p className="font-medium">$0</p>                   {/* Base hire cost */}
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>                   {/* Weather route hire cost */}
            </div>
          </div>
          
          {/* Total Estimated Cost Row - Sum of all costs */}
          <div className="grid grid-cols-2">
            <div className="p-4 border-r">
              <p className="text-sm text-gray-500">Total Est. Cost</p>
              <p className="font-medium">$0</p>                   {/* Base total cost */}
            </div>
            <div className="p-4">
              <p className="font-medium">$0</p>                   {/* Weather route total cost */}
            </div>
          </div>
        </div>
      </div>
      
      {/* MORE DETAILS BUTTON - Links to detailed route information */}
      <div className="mt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-between bg-white hover:bg-gray-50 py-6"
        >
          <div className="flex items-center">
            <div className="font-medium">More Details</div>
            <div className="text-sm text-gray-500 ml-2">Route ID, Weather, Waypoints etc...</div>
          </div>
          <ChevronRight className="h-5 w-5" />    {/* Right arrow indicator */}
        </Button>
      </div>
    </div>
  );
};

export default RouteStats;