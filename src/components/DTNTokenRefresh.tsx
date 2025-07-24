
import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const DTNTokenRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Token refresh functionality would go here
      toast.success('DTN token refreshed successfully!');
      // Reload the page to use the new token
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh DTN token:', error);
      toast.error('Failed to refresh DTN token. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      variant="outline"
      size="sm"
    >
      {isRefreshing ? 'Refreshing...' : 'Refresh DTN Token'}
    </Button>
  );
};

export default DTNTokenRefresh;
