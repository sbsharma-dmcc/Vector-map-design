
import React from 'react';
import { Search } from 'lucide-react';

const MapTopControls: React.FC = () => {
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
        <button className="flex items-center bg-blue-500 text-white rounded-md px-3 py-2 text-sm shadow-sm">
          <span className="mr-1">+</span> New Voyage
        </button>
        
        {/* <div className="flex items-center bg-white rounded-md shadow-sm px-3 py-2">
          <span className="text-sm mr-1">Notifications Feed</span>
          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
        </div> */}
      </div>
    </div>
  );
};

export default MapTopControls;
