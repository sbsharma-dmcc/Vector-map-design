
import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';

interface MapTopControlsProps {
  currentMapStyle: string;
  setCurrentMapStyle: (style: string) => void;
  LIGHT_MAP_STYLE: string;
  DARK_MAP_STYLE: string;
}

const MapTopControls: React.FC<MapTopControlsProps> = ({
  currentMapStyle,
  setCurrentMapStyle,
  LIGHT_MAP_STYLE,
  DARK_MAP_STYLE
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-2">
      <div className="flex items-center bg-white rounded-md shadow-sm">
        <Search className="h-5 w-5 ml-2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search vessel or IMO" 
          className="py-2 px-2 bg-transparent outline-none text-sm w-56"
        />
      </div>
      
      <div className="flex gap-3">
        <button 
          className="flex items-center bg-blue-500 text-white rounded-md px-3 py-2 text-sm shadow-sm"
        >
          <span className="mr-1">+</span> New Voyage
        </button>

        <button
          onClick={() => {
            const newStyle = currentMapStyle === LIGHT_MAP_STYLE ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;
            setCurrentMapStyle(newStyle);
            sessionStorage.setItem('mapStyle', newStyle); // Save preference
          }}
          className="flex items-center bg-white rounded-md px-3 py-2 text-sm shadow-sm"
          title="Toggle Map Style"
        >
          {currentMapStyle === LIGHT_MAP_STYLE ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default MapTopControls;
