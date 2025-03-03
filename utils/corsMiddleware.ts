import type { VercelRequest, VercelResponse } from '@vercel/node';

export const corsMiddleware = (req: VercelRequest, res: VercelResponse) => {
  const allowedOrigins = 
  ['http://localhost:8087', 
  'http://localhost:3000',
  'https://bbe-server-edwinder237s-projects.vercel.app',
  'https://beyondbooking.vercel.app',
  'https://dc2198d9-0787-417c-8d12-581c46d1faed.dev.wix-code.com',
  'https://v0-admin-app-c9qugobpiap.vercel.app' ]; //wix server DEV
  
  
  const origin = req.headers.origin; // May be undefined if not present

  // Check if the request's origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS,DELETE,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } else {
    // Optionally handle the case where the origin is not allowed
    console.warn(`Origin not allowed:', ${origin} host:${req?.headers?.host}`);
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicate that preflight was handled
  }

  return false; // Indicate that further processing can continue
};