import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware } from './auth/authMiddleware'; // Ensure the path is correct
import { fetchAccessToken } from './auth/authMiddleware';

const GUESTY_API_URL = 'https://booking.guesty.com/api/v1/listings'; // Change to the relevant endpoint

const handler = async (req: VercelRequest, res: VercelResponse) => {
    
        try {
            const response = await fetchAccessToken()

            const data = await response.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching listings:', error.message);
            res.status(500).json({ error: 'Error fetching listings' });
        }
  
};

export default handler; // Ensure this is a default export