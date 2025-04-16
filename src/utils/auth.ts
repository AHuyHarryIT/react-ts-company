export const isTokenExpired = (tokenExpiration: number | null): boolean => {
  if (!tokenExpiration) return true;
  return Date.now() > tokenExpiration;
};
