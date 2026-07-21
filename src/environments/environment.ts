// Environment configuration
// Auto-detects production vs development by hostname.
// In production (Vercel/Railway), the hostname won't be localhost.
//
// ⚠️ IMPORTANT: After provisioning your Railway backend project,
// update the production apiUrl below to your actual Railway domain:
//   "https://your-project-name.up.railway.app"

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

export const environment = {
  production: !hostname.includes('localhost') && !hostname.includes('127.0.0.1'),
  apiUrl: hostname.includes('localhost') || hostname.includes('127.0.0.1')
    ? 'http://localhost:8027'
    : 'https://wolverinestack-api.up.railway.app', // ← UPDATE THIS after Railway provisions
};
