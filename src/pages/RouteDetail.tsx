/**
 * ROUTE DETAIL PAGE
 * 
 * This is the main page component for displaying detailed route information.
 * It combines multiple child components to create a comprehensive route management interface:
 * 
 * LAYOUT STRUCTURE:
 * - Left Sidebar: RouteHeader + RouteTabs + RouteStats
 * - Right Side: Map with timeline overlay and layer controls
 * 
 * KEY FEATURES:
 * - Route visualization with base and weather-optimized paths
 * - Interactive vessel animation along the route timeline
 * - Layer management for weather overlays and base map styles
 * - Voyage completion workflow with dialogs
 * - Special handling for RT-001 route with custom interface
 * 
 * STATE MANAGEMENT:
 * - Route data and voyage status
 * - Map layers and visualization options
 * - Animation state and vessel positioning
 * - Dialog state for voyage completion workflow
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import MapLayersPanel from '../components/MapLayersPanel';
import RT001MapInterface from '../components/RT001MapInterface';
import CompleteVoyageDialog from '../components/CompleteVoyageDialog';
import VoyageCompletedDialog from '../components/VoyageCompletedDialog';
import RouteHeader from '../components/RouteHeader';
import RouteTabs from '../components/RouteTabs';
import RouteStats from '../components/RouteStats';
import RouteTimeline from '../components/RouteTimeline';
import { Button } from '@/components/ui/button';
import { generateMockRoutes, generateMockVessels, Route } from '@/lib/vessel-data';
import { useToast } from '@/hooks/use-toast';

const RouteDetail = () => {
  // ROUTE IDENTIFICATION - Get route ID from URL parameters
  const { id } = useParams<{ id: string }>();
  
  // ROUTE DATA STATE
  const [route, setRoute] = useState<Route | null>(null);          // Current route information
  
  // TAB AND VIEW STATE
  const [activeTab, setActiveTab] = useState<'base' | 'weather'>('base'); // Current route view mode
  
  // VESSEL ANIMATION STATE
  const [vesselPosition, setVesselPosition] = useState<[number, number] | null>(null); // Current vessel position
  const [isAnimating, setIsAnimating] = useState(false);           // Animation status flag
  const animationRef = useRef<number | null>(null);               // Animation frame reference
  
  // MAP LAYER STATE
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);   // Layer panel visibility
  const [activeBaseLayer, setActiveBaseLayer] = useState('default'); // Active base map style
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({ // Weather layer toggles
    pressure: false,    // Atmospheric pressure overlay
    storm: false,       // Storm tracking overlay
    current: false,     // Ocean current overlay
    wind: false,         // Wind pattern overlay
    nautical: false,
    rasterWind: false
  });
  
  // GLOBE VIEW STATE
  const [isGlobeViewEnabled, setIsGlobeViewEnabled] = useState(false);
  
  // VOYAGE COMPLETION WORKFLOW STATE
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);           // Complete voyage dialog
  const [isCompletedConfirmationOpen, setIsCompletedConfirmationOpen] = useState(false); // Confirmation dialog
  const [voyageStatus, setVoyageStatus] = useState<'active' | 'completed'>('active'); // Current voyage status
  
  // UTILITIES
  const { toast } = useToast();                                   // Toast notification system
  
  // ROUTE DATA INITIALIZATION
  useEffect(() => {
    // TODO: In a real app, we would fetch the specific route from an API
    // For now, we'll generate mock data and find the route by ID
    const mockVessels = generateMockVessels(25);
    const mockRoutes = generateMockRoutes(mockVessels);
    const foundRoute = mockRoutes.find(route => route.id === id);
    
    if (foundRoute) {
      setRoute(foundRoute);
    }
  }, [id]);

  // ROUTE COORDINATE DEFINITIONS
  // Base route: Direct/planned path between start and end points
  const baseRouteCoordinates: [number, number][] = [
    [121.08295, 29.52432], // Start point - matches header coordinates
    [124.08295, 32.52432], // Waypoint 1
    [127.08295, 35.52432], // Waypoint 2
    [130.08295, 38.52432], // Waypoint 3
    [133.08295, 42.52432], // Waypoint 4
    [135.08295, 45.52432], // End point
  ];

  // Weather-optimized route: Adjusted path considering weather conditions
  const weatherRouteCoordinates: [number, number][] = [
    [121.08295, 29.52432], // Same start point as base route
    [125.08295, 33.52432], // Weather-adjusted waypoint 1
    [128.08295, 37.52432], // Weather-adjusted waypoint 2
    [131.08295, 40.52432], // Weather-adjusted waypoint 3
    [133.08295, 43.52432], // Weather-adjusted waypoint 4
    [135.08295, 45.52432], // Same end point as base route
  ];

  // VESSEL POSITION INITIALIZATION
  // Set initial vessel position when tab changes or on first load
  useEffect(() => {
    if (!vesselPosition && activeTab === 'base' && baseRouteCoordinates.length > 0) {
      setVesselPosition(baseRouteCoordinates[0]);        // Start at beginning of base route
    } else if (!vesselPosition && activeTab === 'weather' && weatherRouteCoordinates.length > 0) {
      setVesselPosition(weatherRouteCoordinates[0]);     // Start at beginning of weather route
    }
  }, [activeTab, vesselPosition, baseRouteCoordinates, weatherRouteCoordinates]);

  // ACTIVE ROUTE DETERMINATION
  // Get the appropriate route coordinates based on the selected tab
  const activeRouteCoordinates = activeTab === 'base' ? baseRouteCoordinates : weatherRouteCoordinates;
  
  // ANIMATION CLEANUP - Cancel any ongoing animation when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // VESSEL ANIMATION FUNCTION
  // Animates the vessel along the route for a specific day segment
  const animateVessel = (dayIndex: number) => {
    // Stop any previous animation to prevent conflicts
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    // Safety check: Ensure we have route coordinates to animate along
    if (activeRouteCoordinates.length === 0) return;

    setIsAnimating(true);                                 // Set animation state flag
    
    // ROUTE SEGMENT CALCULATION
    // Calculate which part of the route to animate based on the selected day
    const totalDays = 5;                                  // Total days in voyage timeline
    const segmentSize = activeRouteCoordinates.length - 1; // Number of route segments
    
    // Calculate start and end indices for this day's segment
    // Day 0: animates from 0% to 20% of route
    // Day 1: animates from 20% to 40% of route, etc.
    const startIdx = Math.floor((dayIndex / totalDays) * segmentSize);
    const endIdx = Math.min(Math.floor(((dayIndex + 1) / totalDays) * segmentSize), segmentSize);
    
    // Extract the coordinate points for this day's segment
    const segmentPoints = activeRouteCoordinates.slice(startIdx, endIdx + 1);
    
    // Ensure we have at least 2 points for animation
    if (segmentPoints.length === 1 && endIdx < activeRouteCoordinates.length - 1) {
      segmentPoints.push(activeRouteCoordinates[endIdx + 1]);
    }
    
    // Position vessel at the start of this segment
    setVesselPosition(segmentPoints[0]);
    
    // ANIMATION SETUP
    let step = 0;                                         // Current animation step
    const totalSteps = 100;                               // Total animation frames for smooth movement
    
    // ANIMATION EXECUTION FUNCTION
    const animate = () => {
      // Check if animation is complete
      if (step >= totalSteps) {
        setIsAnimating(false);                            // Clear animation flag
        return;
      }
      
      // POSITION INTERPOLATION - Calculate vessel position between waypoints
      if (segmentPoints.length >= 2) {
        const progress = step / totalSteps;               // Overall progress (0 to 1)
        
        // Determine which segment we're currently animating between
        const currentSegmentIndex = Math.min(
          Math.floor(progress * (segmentPoints.length - 1)),
          segmentPoints.length - 2
        );
        
        // Calculate progress within the current segment
        const segmentProgress = (progress * (segmentPoints.length - 1)) % 1;
        
        // Get the two points we're interpolating between
        const p1 = segmentPoints[currentSegmentIndex];     // Start point of current segment
        const p2 = segmentPoints[currentSegmentIndex + 1]; // End point of current segment
        
        // Linear interpolation between the two points
        const newLng = p1[0] + (p2[0] - p1[0]) * segmentProgress; // Longitude
        const newLat = p1[1] + (p2[1] - p1[1]) * segmentProgress; // Latitude
        
        // Update vessel position on the map
        setVesselPosition([newLng, newLat]);
      }
      
      // Continue animation
      step++;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // START ANIMATION
    animationRef.current = requestAnimationFrame(animate);
    
    // Show user feedback about the animation
    toast({
      title: `Day ${dayIndex === 0 ? "Today" : dayIndex + 1}`,
      description: "Animating vessel journey for this day"
    });
  };

  // EVENT HANDLERS

  // VOYAGE COMPLETION HANDLERS
  const handleCompleteVoyage = () => {
    setIsCompleteDialogOpen(true);                        // Open completion dialog
  };

  const handleModifyVoyage = () => {
    // TODO: Implement voyage modification functionality
    toast({
      title: "Modify Voyage",
      description: "Voyage modification feature will be available soon."
    });
  };

  const handleVoyageCompletion = (comments: string) => {
    console.log('Voyage completed with comments:', comments);
    setVoyageStatus('completed');                         // Update voyage status
    
    // TODO: In a real app, send completion data to backend
    // Example: completeVoyage({ routeId: id, comments, completedAt: new Date() });
    
    toast({
      title: "Voyage Completed Successfully",
      description: "The voyage has been marked as completed and all data has been saved."
    });

    // Show confirmation dialog to user
    setIsCompletedConfirmationOpen(true);
  };

  // MAP LAYER HANDLERS
  const handleLayerToggle = (layerType: string, enabled: boolean) => {
    console.log(`Layer ${layerType} ${enabled ? 'enabled' : 'disabled'}`);
    
    // Update the specific layer state
    setActiveLayers(prev => ({
      ...prev,
      [layerType]: enabled
    }));
    
    // Provide user feedback
    toast({
      title: `${layerType.charAt(0).toUpperCase() + layerType.slice(1)} Layer`,
      description: `${enabled ? 'Enabled' : 'Disabled'} ${layerType} overlay`
    });
  };

  const handleBaseLayerChange = (layer: string) => {
    setActiveBaseLayer(layer);                            // Update active base layer
    console.log(`Base layer changed to: ${layer}`);
    
    // Provide user feedback
    toast({
      title: "Base Layer Changed",
      description: `Switched to ${layer} base layer`
    });
  };

  // LOADING STATE
  if (!route) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p>Loading route details...</p>
      </div>
    );
  }

  // VESSEL DATA PREPARATION
  // Create vessel object for map display
  const routeVessel = {
    id: route.vesselId,
    name: route.name,
    type: 'green' as const,                               // Vessel marker color
    position: vesselPosition || baseRouteCoordinates[0]   // Current or initial position
  };

  // SPECIAL ROUTE HANDLING
  // Check if this is the RT-001 route which has a custom interface
  const isRT001 = id === 'RT-001';

  // MAIN COMPONENT RENDER
  return (
    <div className="absolute inset-0 flex">
      {/* LEFT SIDEBAR - Route information and controls */}
      <div className="w-96 flex flex-col overflow-hidden">
        {/* Route header with navigation and actions */}
        <RouteHeader 
          route={route}
          routeId={id!}
          voyageStatus={voyageStatus}
          onModifyVoyage={handleModifyVoyage}
          onCompleteVoyage={handleCompleteVoyage}
        />
        
        {/* Scrollable sidebar content */}
        <div className="flex-1 bg-gray-100 overflow-y-auto">
          {/* Tab navigation between base and weather routes */}
          <RouteTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {/* Route statistics and comparison data */}
          <RouteStats />
        </div>
      </div>
      
      {/* RIGHT SIDE - Map interface covering remaining space */}
      <div className="flex-1 relative">
        {/* MAP LAYERS CONTROL PANEL - Overlay for layer management */}
        <MapLayersPanel
          isOpen={layersPanelOpen}
          onClose={() => setLayersPanelOpen(false)}
          onLayerToggle={handleLayerToggle}
          activeLayer={activeBaseLayer}
          onBaseLayerChange={handleBaseLayerChange}
          isGlobeViewEnabled={isGlobeViewEnabled}
          onGlobeViewToggle={setIsGlobeViewEnabled}
        />
        
        {/* CONDITIONAL MAP INTERFACE RENDERING */}
        {/* Special interface for RT-001 route, standard interface for others */}
        {isRT001 ? (
          // Custom RT-001 map interface with specialized features
          <RT001MapInterface
            activeTab={activeTab}
            onDayClick={animateVessel}
            onLayersToggle={() => setLayersPanelOpen(!layersPanelOpen)}
            activeLayers={activeLayers}
          />
        ) : (
          // Standard map interface for all other routes
          <>
            {/* LAYER TOGGLE BUTTON - Fixed position control */}
            <div className="absolute bottom-20 left-4 z-10">
              <Button 
                onClick={() => setLayersPanelOpen(!layersPanelOpen)}
                className="bg-white hover:bg-gray-50 text-gray-800 shadow-lg border border-gray-200 w-12 h-12 p-0"
                size="icon"
              >
                <Layers className="h-5 w-5" />
              </Button>
            </div>
            
            {/* MAIN MAP COMPONENT - Displays routes, vessels, and layers */}
            <MapboxMap 
              vessels={[routeVessel]}                     // Vessel to display on map
              showRoutes={true}                           // Enable route visualization
              baseRoute={baseRouteCoordinates}            // Base route coordinates
              weatherRoute={weatherRouteCoordinates}      // Weather-optimized route coordinates
              activeRouteType={activeTab}                 // Which route to highlight
              activeLayers={activeLayers}                 // Weather overlay states
              activeBaseLayer={activeBaseLayer}           // Base map style
              isGlobeViewEnabled={isGlobeViewEnabled}
            />
            
            {/* INTERACTIVE TIMELINE - Overlay for voyage animation control */}
            <RouteTimeline 
              onDayClick={animateVessel}                  // Animation trigger callback
              isAnimating={isAnimating}                   // Animation status for UI feedback
            />
          </>
        )}
      </div>

      {/* VOYAGE COMPLETION WORKFLOW DIALOGS */}
      
      {/* Initial completion dialog - Collects completion data */}
      <CompleteVoyageDialog
        isOpen={isCompleteDialogOpen}
        onClose={() => setIsCompleteDialogOpen(false)}
        onComplete={handleVoyageCompletion}
        routeName={route?.name || ''}
      />

      {/* Confirmation dialog - Shows completion success */}
      <VoyageCompletedDialog
        isOpen={isCompletedConfirmationOpen}
        onClose={() => setIsCompletedConfirmationOpen(false)}
        routeName={route?.name || ''}
      />
    </div>
  );
};

export default RouteDetail;
