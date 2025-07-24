
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackScreenViewed } from '@/utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track screen views automatically on route changes
    const screenName = getScreenNameFromPath(location.pathname);
    trackScreenViewed(screenName);
  }, [location]);

  return {
    // Re-export all tracking functions for easy access
    trackUserSignedUp: (userRole: string) => import('@/utils/analytics').then(({ trackUserSignedUp }) => trackUserSignedUp(userRole)),
    trackUserLoggedIn: (method: string, userId: string) => import('@/utils/analytics').then(({ trackUserLoggedIn }) => trackUserLoggedIn(method, userId)),
    trackVesselSelected: (vesselId: string, name: string) => import('@/utils/analytics').then(({ trackVesselSelected }) => trackVesselSelected(vesselId, name)),
    trackButtonClicked: (buttonName: string, screen: string) => import('@/utils/analytics').then(({ trackButtonClicked }) => trackButtonClicked(buttonName, screen)),
    trackFilterApplied: (filterType: string, value: string) => import('@/utils/analytics').then(({ trackFilterApplied }) => trackFilterApplied(filterType, value)),
  };
};

const getScreenNameFromPath = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard';
    case '/routes':
      return 'Routes';
    case '/history':
      return 'History';
    default:
      if (pathname.startsWith('/routes/')) {
        return 'Route_Details';
      }
      return 'Unknown';
  }
};
