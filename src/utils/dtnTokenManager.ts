
// Simple direct token management without automatic refresh
let directToken: string | null = null;

export const setDirectDTNToken = (token: string): void => {
  directToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  console.log('Direct DTN token set');
};

export const getDirectDTNToken = (): string | null => {
  return directToken;
};

export const clearDirectDTNToken = (): void => {
  directToken = null;
  console.log('Direct DTN token cleared');
};

// Updated token with correct map API permissions
const fallbackToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpfX21pZW13NGhoTmdvQWQxR3N6ciJ9.eyJodHRwczovL2F1dGguZHRuLmNvbS9hY2NvdW50SWQiOiIyNTY1Mzk5IiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vdmVuZG9ySWQiOiJ1bmtub3duIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vY3VzdG9tZXJJZCI6IjI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9wcm9kdWN0Q29kZSI6IkRUTld4QVBJXzI1NjUzOTkiLCJodHRwczovL2F1dGguZHRuLmNvbS9yZXF1ZXN0ZXJJcCI6IjE4LjIxMy4xNzQuMjciLCJodHRwczovL2F1dGguZHRuLmNvbS9ycHMiOiIyNTAiLCJodHRwczovL2F1dGguZHRuLmNvbS90aWVyIjoiRW50ZXJwcmlzZSIsImh0dHBzOi8vYXV0aC5kdG4uY29tL3F1b3RhIjoiMTAwMDAwIiwiaHR0cHM6Ly9hdXRoLmR0bi5jb20vYXJlYVNpemUiOiIwIiwiaXNzIjoiaHR0cHM6Ly9pZC5hdXRoLmR0bi5jb20vIiwic3ViIjoiRnpGbHZJajNjUFBhejhlc3B5ckhEN0FySnVlY0xOR1BAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbWFwLmFwaS5kdG4uY29tIiwiaWF0IjoxNzUwNzE1MTA2LCJleHAiOjE3NTA4MDE1MDYsInNjb3BlIjoicmVhZDpjYXRhbG9nLWRlZmF1bHQgd2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJGekZsdklqM2NQUGF6OGVzcHlySEQ3QXJKdWVjTE5HUCIsInBlcm1pc3Npb25zIjpbInJlYWQ6Y2F0YWxvZy1kZWZhdWx0Iiwid2VhdGhlci5tYXAuY2F0YWxvZy1wbHVzOnJlYWQiXX0.lRn9dOllUB-SDhxXP2n261SC8JGG1YSWm5t9N6tF-HhjBhE0ESC7NZ3fqLvM9uR9SZohtB5QbdhNZpHo3bjhgoPB6tk9U0z_NpYWq5PSbwYJIELWdUxh81dFU0mh0l6gOL_6GpkcHoWOrw3twP1JR3YxN1H0DooSIE4liwoE-cXEyfRaMp5SVnlJf-yd546nzIzeAKp4uStZQLE6_JDyKoDPx0IlSqnme8flD0cSw5fOVMuCHuAMF0N1G4erJJk7Wpomiru3_t7jBrfeKtSAR02zzAt7TYH13bAr_c0CDEHccwpKIokJ64FgFLs1SVQGCj33T3p6RPsB6D4ys5y93Q";

// Simple sync method that returns direct token or fallback
export const getDTNToken = (): string => {
  if (directToken) {
    console.log('Using direct DTN token');
    return directToken;
  }
  
  console.log('Using fallback DTN token');
  return fallbackToken;
};

// Legacy compatibility function - now just returns the direct token or fallback
export const getValidDTNToken = async (): Promise<string> => {
  return getDTNToken();
};
