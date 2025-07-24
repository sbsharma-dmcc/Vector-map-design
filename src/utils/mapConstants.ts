
/**
 * MAP CONSTANTS AND LAYER CONFIGURATIONS
 * 
 * This file defines all the map-related constants including:
 * - DTN API token management for weather layers
 * - Weather layer configurations with DTN layer IDs
 * - Base layer style definitions
 * - Bathymetry depth contour settings
 * - Default map tokens and authentication
 */

import { getValidDTNToken } from './dtnTokenManager';

// DTN API TOKEN MANAGEMENT - Dynamically retrieves valid token for weather layers
export const getDTNToken = async () => {
  return await getValidDTNToken();
};

// WEATHER LAYER CONFIGURATIONS
// Maps internal layer names to DTN API layer IDs and tile set IDs for weather overlays
export const layerConfigs = {
  pressure: { dtnLayerId: 'fcst-manta-mean-sea-level-pressure-isolines', tileSetId: '2703fb6d-0ace-43a3-aca1-76588e3ac9a8' },
  storm: { dtnLayerId: 'storm', tileSetId: 'storm-latest' },
  current: { dtnLayerId: 'current', tileSetId: 'current-latest' },
  wind: { dtnLayerId: 'fcst-manta-wind-speed-contours', tileSetId: 'b864ff86-22af-41fc-963e-38837d457566' },
  tropicalStorms: { dtnLayerId: 'sevwx-dtn-tropical-cyclones-plot', tileSetId: 'f785e1fe-1624-40a3-be75-ed14c2c4a53c' }
};

// BASE LAYER STYLES - Different map visual styles for base layers
// Currently all point to the same style, but can be customized for different views
export const baseLayerStyles = {
  default: "mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7",  // Standard marine view
  swell: "mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7",    // Swell-focused view
  waves: "mapbox://styles/geoserve/cmbf0vz6e006g01sdcdl40oi7"      // Wave-focused view
};

// BATHYMETRY DEPTH CONTOURS CONFIGURATION
// Defines depth levels and visual styling for underwater terrain visualization
export const bathymetryContours = {
  depths: [0, 25, 50, 100],         // Depth levels in meters (0=coastline, 25m, 50m, 100m)
  colors: {
    0: '#0066CC',    // Deep blue for 0m (coastline/surface)
    25: '#3399FF',   // Medium blue for 25m depth
    50: '#66B2FF',   // Light blue for 50m depth  
    100: '#99CCFF'   // Very light blue for 100m depth
  }
};

// MAPBOX ACCESS TOKENS
export const defaultMapToken = 'pk.eyJ1IjoiZ2Vvc2VydmUiLCJhIjoiY201Z2J3dXBpMDU2NjJpczRhbmJubWtxMCJ9.6Kw-zTqoQcNdDokBgbI5_Q';

// DTN AUTHENTICATION TOKEN - Updated with map API permissions for weather layers
export const dtnToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwNzE1MTA2LCJleHAiOjE3NTA4MDE1MDYsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.lRn9dOllUB-SDhxXP2n261SC8JGG1YSWm5t9N6tF-HhjBhE0ESC7NZ3fqLvM9uR9SZohtB5QbdhNZpHo3bjhgoPB6tk9U0z_NpYWq5PSbwYJIELWdUxh81dFU0mh0l6gOL_6GpkcHoWOrw3twP1JR3YxN1H0DooSIE4liwoE-cXEyfRaMp5SVnlJf-yd546nzIzeAKp4uStZQLE6_JDyKoDPx0IlSqnme8flD0cSw5fOVMuCHuAMF0N1G4erJJk7Wpomiru3_t7jBrfeKtSAR02zzAt7TYH13bAr_c0CDEHccwpKIokJ64FgFLs1SVQGCj33T3p6RPsB6D4ys5y93Q";
