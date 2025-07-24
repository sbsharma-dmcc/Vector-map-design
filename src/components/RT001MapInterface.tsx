
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Layers } from 'lucide-react';

interface RT001MapInterfaceProps {
  activeTab: 'base' | 'weather';
  onDayClick: (dayIndex: number) => void;
  onLayersToggle: () => void;
  activeLayers: Record<string, boolean>;
}

const RT001MapInterface: React.FC<RT001MapInterfaceProps> = ({
  activeTab,
  onDayClick,
  onLayersToggle,
  activeLayers
}) => {
  const [currentDay, setCurrentDay] = useState(0);

  // Route coordinates for visualization
  const routePoints = [
    { x: '15%', y: '65%', day: 0, label: 'Start - Chiba' },
    { x: '25%', y: '50%', day: 1, label: 'Day 1' },
    { x: '40%', y: '35%', day: 2, label: 'Day 2' },
    { x: '60%', y: '25%', day: 3, label: 'Day 3' },
    { x: '80%', y: '20%', day: 4, label: 'End Point' }
  ];

  // Vessel position based on current day
  const currentPosition = routePoints[currentDay];

  const handleDayClick = (dayIndex: number) => {
    setCurrentDay(dayIndex);
    onDayClick(dayIndex);
  };

  // Timeline dates
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: i === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      date: date.getDate(),
      active: i === currentDay
    };
  });

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden">
      {/* Ocean background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-15 animate-pulse"></div>
      </div>

      {/* Route path visualization */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Base route line */}
        <path
          d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
          stroke={activeTab === 'base' ? "url(#routeGradient)" : "rgba(255,255,255,0.3)"}
          strokeWidth="3"
          fill="none"
          strokeDasharray={activeTab === 'base' ? "none" : "5,5"}
          className="transition-all duration-500"
        />
        
        {/* Weather route line (slightly offset) */}
        {activeTab === 'weather' && (
          <path
            d={`M 15% 65% L 30% 45% L 45% 30% L 65% 22% L 80% 20%`}
            stroke="url(#routeGradient)"
            strokeWidth="3"
            fill="none"
            className="transition-all duration-500"
          />
        )}

        {/* Route waypoints */}
        {routePoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={index <= currentDay ? "#10b981" : "#64748b"}
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            {index === currentDay && (
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                opacity="0.6"
                className="animate-ping"
              />
            )}
          </g>
        ))}

        {/* Current vessel position */}
        <g transform={`translate(${currentPosition.x}, ${currentPosition.y})`}>
          <circle
            cx="0"
            cy="0"
            r="8"
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-pulse"
          />
          <polygon
            points="-4,-8 4,-8 0,-16"
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth="1"
          />
        </g>
      </svg>

      {/* Weather layer indicators */}
      {activeLayers.wind && (
        <div className="absolute top-1/4 right-1/3 text-white text-xs opacity-70">
          <div className="flex items-center space-x-1">
            <span>→</span>
            <span>15kts</span>
          </div>
        </div>
      )}

      {activeLayers.pressure && (
        <div className="absolute top-1/2 left-1/4">
          <svg width="100" height="60">
            <path
              d="M 10 30 Q 30 10 50 30 Q 70 50 90 30"
              stroke="#ff6b35"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
      )}

      {/* Geographic labels */}
      <div className="absolute top-1/4 left-1/6 text-white text-sm font-medium opacity-80">
        Chiba Port
      </div>
      <div className="absolute bottom-1/3 right-1/4 text-white text-sm font-medium opacity-80">
        Pacific Ocean
      </div>

      {/* Layers toggle button */}
      <div className="absolute bottom-20 left-4 z-10">
        <Button 
          onClick={onLayersToggle}
          className="bg-white hover:bg-gray-50 text-gray-800 shadow-lg border border-gray-200 w-12 h-12 p-0"
          size="icon"
        >
          <Layers className="h-5 w-5" />
        </Button>
      </div>

      {/* Timeline Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-80 text-white">
        <div className="flex overflow-x-auto">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`flex-1 p-4 text-center cursor-pointer border-t-2 ${
                day.active ? 'bg-gray-900 border-blue-500' : 'border-transparent'
              } hover:bg-gray-700 transition-colors`}
              onClick={() => handleDayClick(index)}
            >
              <div className="text-sm">{day.date} {day.day}</div>
              {index === currentDay && (
                <div className="text-xs text-blue-400 mt-1">Current Position</div>
              )}
            </div>
          ))}
          <div className="p-4 flex items-center justify-center cursor-pointer">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Route info overlay */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
        <div className="text-sm font-medium">Route RT-001</div>
        <div className="text-xs opacity-80">{activeTab === 'base' ? 'Base Route' : 'Weather Routing'}</div>
        <div className="text-xs opacity-80 mt-1">
          Day {currentDay + 1} / 5
        </div>
      </div>
    </div>
  );
};

export default RT001MapInterface;
