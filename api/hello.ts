import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../utils/corsMiddleware'; 



  export default function handler(req: VercelRequest, res: VercelResponse) {
    // Call the CORS middleware
    const isPreflight = corsMiddleware(req, res);
    if (isPreflight) return; // If preflight was handled, exit early

    // Handle the main request
    const { name = 'World' } = req.query;
    console.log("Back-End CALLED")
    return res.json({
      message: `Hello ${name}!`,
    });
  }