/**
 * ROUTE TIMELINE COMPONENT
 * 
 * This component displays an interactive timeline showing the voyage progress
 * across multiple days. Features include:
 * - Daily waypoints with weather conditions and temperatures
 * - Interactive timeline dots that trigger vessel animation when clicked
 * - Real-time animation status indicator
 * - Weather icons and temperature display for each day
 * 
 * When a user clicks on any day, it triggers the vessel animation to show
 * the vessel's position and movement for that specific day segment.
 */

import React from 'react';
import { Calendar } from 'lucide-react';

// Props interface for timeline interaction
interface RouteTimelineProps {
  onDayClick: (dayIndex: number) => void;    // Callback when a day is clicked
  isAnimating: boolean;                      // Whether animation is currently running
}

const RouteTimeline: React.FC<RouteTimelineProps> = ({ onDayClick, isAnimating }) => {
  // Timeline data - Mock data representing 5 days of voyage
  const timelineDays = [
    { day: 'Today', time: '11:50', weather: '⛅', temp: '24°C' },   // Day 0: Current day
    { day: 'Day 2', time: '11:50', weather: '☀️', temp: '26°C' },   // Day 1: Clear weather
    { day: 'Day 3', time: '11:50', weather: '🌧️', temp: '22°C' },   // Day 2: Rainy conditions
    { day: 'Day 4', time: '11:50', weather: '⛅', temp: '25°C' },   // Day 3: Partly cloudy
    { day: 'Day 5', time: '11:50', weather: '☀️', temp: '27°C' }    // Day 4: Clear and warm
  ];

  return (
    // TIMELINE CONTAINER - Positioned at bottom center of map
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[600px] z-10">
      {/* TIMELINE HEADER - Title and animation status */}
      <div className="flex items-center mb-3">
        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Route Timeline</h3>
        {/* Animation indicator - Only shown when vessel is animating */}
        {isAnimating && (
          <span className="ml-2 text-sm text-blue-600 animate-pulse">Animating...</span>
        )}
      </div>
      
      {/* TIMELINE DAYS - Interactive day markers */}
      <div className="flex items-center justify-between space-x-4">
        {timelineDays.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            onClick={() => onDayClick(index)}    // Trigger animation for this day
          >
            {/* Day label */}
            <div className="text-xs text-gray-500 mb-1">{item.day}</div>
            
            {/* Timeline dot - Visual marker for this day */}
            <div className="w-3 h-3 bg-blue-500 rounded-full mb-2 hover:bg-blue-600 transition-colors"></div>
            
            {/* Time for this day */}
            <div className="text-xs font-medium text-gray-700">{item.time}</div>
            
            {/* Weather emoji */}
            <div className="text-lg my-1">{item.weather}</div>
            
            {/* Temperature */}
            <div className="text-xs text-gray-500">{item.temp}</div>
          </div>
        ))}
      </div>
      
      {/* INSTRUCTION TEXT - Helps users understand the interaction */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Click on any day to animate vessel position
      </div>
    </div>
  );
};

export default RouteTimeline;