
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface MapTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const MapTokenInput: React.FC<MapTokenInputProps> = ({ onTokenSubmit }) => {
  const { toast } = useToast();

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    if (token) {
      onTokenSubmit(token);
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox access token",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Mapbox Access Token Required</h2>
        <p className="mb-4 text-gray-700">
          To view the vessel tracking map, please enter your Mapbox public access token.
          You can find this in your Mapbox account dashboard.
        </p>
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Mapbox Access Token:
            </label>
            <input 
              type="text" 
              id="token" 
              name="token" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="pk.eyJ1IjoieW91..." 
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Load Map
          </button>
        </form>
      </div>
    </div>
  );
};

export default MapTokenInput;
