import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = '0oajqeszxumg9YNjW5d7';
const CLIENT_SECRET = 'BPI0JMZFiZ_8xzLw6RiO8OpVSvPB6qXXevr66OpPAK_za0mEmyTWuQsyEKwzcyTk';
const AUTH_URL = 'https://booking.guesty.com/oauth2/token';
let accessToken: string | null = null;
let expiresAt: number | null = null;
const EXPIRATION_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

// Function to fetch the access token
export const fetchAccessToken = async () => {
    try {
        const response = await fetch('https://booking.guesty.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'booking_engine:api',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }).toString(),
        });

        console.log("res",response)

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Error fetching access token: ${errorResponse.message}`);
        }

        const data = await response.json();
        const { access_token, expires_in } = data;

        accessToken = access_token;
        expiresAt = Date.now() + expires_in * 1000; // Convert to milliseconds
        return access_token
    } catch (error) {
        console.error('Error fetching access token:', error.message);
        throw new Error('Unable to fetch access token');
    }
};

// Middleware function to ensure a valid token
export const authMiddleware = async (req: VercelRequest, res: VercelResponse, next: () => void) => {
    const isTokenExpired = !accessToken || (expiresAt && Date.now() >= expiresAt - EXPIRATION_BUFFER);

    if (isTokenExpired) {
        await fetchAccessToken();
    }

    req.headers['Authorization'] = `Bearer ${accessToken}`;
    next();
};