import type { VercelRequest, VercelResponse } from '@vercel/node';

export const corsMiddleware = (req: VercelRequest, res: VercelResponse) => {
  // Allow all origins by setting CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicate that preflight was handled
  }

  return false; // Indicate that further processing can continue
};