/**
 * ROUTE TABS COMPONENT
 * 
 * This component provides tab navigation between two route viewing modes:
 * - Base Route: Shows the direct/planned route between start and end points
 * - Weather Routing: Shows the optimized route considering weather conditions
 * 
 * The active tab determines which route coordinates are displayed on the map
 * and which route data is used for calculations and animations.
 */

import React from 'react';
import { Button } from '@/components/ui/button';

// Props interface for tab control
interface RouteTabsProps {
  activeTab: 'base' | 'weather';                    // Currently selected tab
  onTabChange: (tab: 'base' | 'weather') => void;   // Callback when tab is changed
}

const RouteTabs: React.FC<RouteTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white">
      {/* TAB CONTAINER - Two equal-width tabs */}
      <div className="flex">
        {/* BASE ROUTE TAB - Direct/planned route */}
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none py-6 ${activeTab === 'base' ? 'bg-gray-100' : ''}`}
          onClick={() => onTabChange('base')}
        >
          <span>Base Route</span>
        </Button>
        
        {/* WEATHER ROUTING TAB - Weather-optimized route */}
        <Button 
          variant="ghost" 
          className={`flex-1 rounded-none py-6 ${activeTab === 'weather' ? 'bg-gray-100' : ''}`}
          onClick={() => onTabChange('weather')}
        >
          <span>Weather Routing</span>
        </Button>
      </div>
    </div>
  );
};

export default RouteTabs;