import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../corsMiddleware'; // Adjust the path as necessary

const LODGIFY_API_KEY = process.env.LODGIFY_API_KEY || 'Rm1RqotAajREi+Nyj+KD9A88huz7Is7pc3u/MNiP6Dd3AQMJL6SgDR5LOhhbvCjQ';
const APP_KEY = process.env.APP_KEY || 'YOUR_APP_KEY'; // Set your APP_KEY here or use environment variables

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // If preflight was handled, exit early

  // Extract parameters from the query
  const { arrival, departure } = req.query;

  // Define fetch options
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-ApiKey': "Rm1RqotAajREi+Nyj+KD9A88huz7Is7pc3u/MNiP6Dd3AQMJL6SgDR5LOhhbvCjQ",
      'X-App-Key': "6Y8NfnB4VT8rsnPaPoS3FnuutAqwrAAIRRooqIgXEK1t7WelINdPJL4GLnUbwj4j6HUzB3gJp/7FT9/v", 
    },
  };

  // Construct the API URL with parameters
  const apiUrl = `https://api.lodgify.com/v2/quote/567440`;

  try {
    const response = await fetch(apiUrl, options);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json(); // Parse the JSON response
    return res.status(200).json(data); // Return the fetched data
  } catch (error) {
    console.error('Error fetching from Lodgify API:', error);
    return res.status(500).json({ error: 'Error fetching data from Lodgify API' });
  }
}