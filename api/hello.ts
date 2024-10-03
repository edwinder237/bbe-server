import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {

  const APP_URL = process.env.APP_URL;
  const PROD_URL = process.env.PROD_URL;
  const allowedOrigin = APP_URL || PROD_URL;
  const origin = req.headers.origin;



  if (origin === allowedOrigin) {
    // Set CORS headers to allow localhost:3000
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin|| 'http://localhost:3000');
  } else {
    // Deny access if the origin is not allowed
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { name = 'World' } = req.query;
  return res.json({
    message: `Hello ${name}!`,
  });
}