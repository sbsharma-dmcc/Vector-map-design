import { init, track, setUserId, identify } from '@amplitude/analytics-browser';

// Initialize Amplitude
const AMPLITUDE_API_KEY = '86a69223d8d1c74f106bb392555b6a0';

export const initAnalytics = () => {
  init(AMPLITUDE_API_KEY, undefined, {
    serverZone: 'EU',
    autocapture: true,
    fetchRemoteConfig: true,
  });
};

// User Authentication & Sessions
export const trackUserSignedUp = (userRole: string) => {
  track('User_Signed_Up', { user_role: userRole });
};

export const trackUserLoggedIn = (method: string, userId: string) => {
  track('User_Logged_In', { method, user_id: userId });
  setUserId(userId);
};

export const trackUserLoggedOut = (userId: string) => {
  track('User_Logged_Out', { user_id: userId });
};

export const trackSessionStarted = (device: string, appVersion: string) => {
  track('Session_Started', { device, app_version: appVersion });
};

export const trackSessionInclude = (errorCode?: string, screen?: string, screenName?: string) => {
  track('Session_include', { 
    error_code: errorCode,
    screen: screen,
    screen_name: screenName
  });
};

// Navigation & Screen Views
export const trackScreenViewed = (screenName: string) => {
  track('Screen_Viewed', { screen_name: screenName });
};

export const trackNavigationClicked = (fromScreen: string, toScreen: string) => {
  track('Navigation_Clicked', { from_screen: fromScreen, to_screen: toScreen });
};

// Feature Usage
export const trackVesselSelected = (vesselId: string, name: string) => {
  track('Vessel_Selected', { vessel_id: vesselId, name });
};

export const trackReportGenerated = (reportType: string, userRole: string) => {
  track('Report_Generated', { report_type: reportType, user_role: userRole });
};

export const trackAlertViewed = (alertType: string, urgency: string) => {
  track('Alert_Viewed', { alert_type: alertType, urgency });
};

export const trackMessageSent = (recipient: string, messageType: string) => {
  track('Message_Sent', { recipient, message_type: messageType });
};

// User Engagement & Actions
export const trackButtonClicked = (buttonName: string, screen: string) => {
  track('Button_Clicked', { button_name: buttonName, screen });
};

export const trackFilterApplied = (filterType: string, value: string) => {
  track('Filter_Applied', { filter_type: filterType, value });
};

export const trackSettingsChanged = (settingName: string, newValue: string) => {
  track('Settings_Changed', { setting_name: settingName, new_value: newValue });
};

// Errors & Performance
export const trackAppCrashed = (errorCode: string, screen: string) => {
  track('App_Crashed', { error_code: errorCode, screen });
};

export const trackSlowLoadingScreen = (screen: string, loadTime: string) => {
  track('Slow_Loading_Screen', { screen, load_time: loadTime });
};

// Set user properties using identify with a simple object
export const setUserRole = (role: string) => {
  identify(undefined, {
    // user_role: role // Commented out - not supported by EventOptions
  });
};
