// Environment configuration
// Auto-detects production vs development by hostname.
// In production (Vercel), the hostname won't be localhost.

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

export const environment = {
  production: !isLocalhost,
  apiUrl: isLocalhost
    ? 'http://localhost:8027'
    : 'https://wolverinestack-api-production.up.railway.app',
};
