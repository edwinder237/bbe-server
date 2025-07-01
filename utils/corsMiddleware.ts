import type { VercelRequest, VercelResponse } from '@vercel/node';

export const corsMiddleware = (req: VercelRequest, res: VercelResponse) => {
  const allowedOrigins = 
  ['http://localhost:8087', 
  'http://localhost:3000',
  'https://bbe-server-edwinder237s-projects.vercel.app',
  'https://beyondbooking.vercel.app',
  'https://dc2198d9-0787-417c-8d12-581c46d1faed.dev.wix-code.com',
  'https://v0-admin-app-c9qugobpiap.vercel.app' ];
  
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
    // 🔥 ADD THESE AUTHENTICATION HEADERS:
    res.setHeader('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Clerk-Auth-Token, X-Clerk-Auth-Reason, X-Clerk-Auth-Message'
    );
    // 🔥 ALLOW CREDENTIALS FOR AUTH:
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    console.warn(`Origin not allowed: ${origin} host:${req?.headers?.host}`);
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
};