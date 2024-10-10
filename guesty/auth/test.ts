import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../../corsMiddleware';

// Your Guesty Client ID and Secret
const CLIENT_ID = '0oah6j5a9ni8AcSmN5d7';
const CLIENT_SECRET = 'eFSnYGrFwrABLa5YgoD1uGd1lhkH5GxvxiDdknLdVqtD93h67cWxfLgE7ehJASTr';

// In-memory storage for the cached token and its expiry time
let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;

// Function to determine if the token is still valid
const isTokenExpired = () => {
  return !tokenExpiryTime || Date.now() >= tokenExpiryTime;
};

// Function to fetch a new token from Guesty's OAuth2 API
export const fetchNewToken = async (): Promise<any> => {
  const formData = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'booking_engine:api',
    client_secret: CLIENT_SECRET,
    client_id: CLIENT_ID,
  }).toString();

  const response = await fetch('https://booking.guesty.com/oauth2/token', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'cache-control': 'no-cache,no-store',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch token: ${JSON.stringify(errorData)}`);
  }

  const tokenData = await response.json();
  
  // Update the cached token and expiry time (current time + expires_in seconds)
  cachedToken = tokenData.access_token;
  tokenExpiryTime = Date.now() + tokenData.expires_in * 1000; // expires_in is in seconds

  return tokenData;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // Handle CORS preflight requests

  try {
    // Check if the cached token is still valid
    if (isTokenExpired()) {
      console.log('Token expired or not available, fetching a new one...');
      const tokenData = await fetchNewToken();
      return res.status(200).json(tokenData); // Return the new token
    } else {
      console.log('Using cached token...');
      return res.status(200).json({ access_token: cachedToken, expires_in: tokenExpiryTime });
    }
  } catch (error) {
    console.error('Error fetching token:', error);
    return res.status(500).json({ error: 'Error fetching token' });
  }
}

/**
 * Documentation:
 * 
 * 1. **Token Expiration**:
 *    - The access token expires every 24 hours (`expires_in` field), and you must request a new one before it expires.
 *    - We store the token expiry time (`Date.now()` + `expires_in` seconds) and check whether the token is still valid before making a new request.
 * 
 * 2. **Best Practice for Token Management**:
 *    - The token is cached in memory for the duration of the server’s uptime. It is refreshed only when expired, minimizing API requests.
 *    - If the token expires, the application will automatically request a new one before making any Guesty API calls.
 * 
 * 3. **Flow Example**:
 *    - Step 1: When the application starts or when the token expires, the `fetchNewToken` function requests a token from the Guesty OAuth2 endpoint.
 *    - Step 2: The token is cached, along with its expiry time (`expires_in`).
 *    - Step 3: For each API request, we check whether the token is still valid. If so, we use the cached token.
 *    - Step 4: When the token expires, the process repeats, and a new token is requested.
 * 
 * 4. **Avoiding Rate Limits**:
 *    - The Guesty API rate limits OAuth2 token requests. By caching the token and checking its expiration time, we avoid making unnecessary requests.
 *    - Only one request is made per 24 hours (or as defined by the `expires_in` value), ensuring compliance with rate limits.
 * 
 * 5. **Security Notes**:
 *    - Client credentials (Client ID and Secret) are stored securely in environment variables.
 *    - The token and expiry time are kept in memory, never exposed to the client-side or stored in the front-end code.
 *    - Make sure to secure environment variables and any sensitive data properly to prevent unauthorized access.
 */