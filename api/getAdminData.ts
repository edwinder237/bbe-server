import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../utils/corsMiddleware';
import { PrismaClient } from '@prisma/client';
import { getRequestCount } from '../utils/requestMetrics';

const prisma = new PrismaClient();
const TIMEOUT_LIMIT = 5000; // 5 seconds timeout for operations

/**
 * Timeout helper function to ensure promises resolve within a time limit.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Start the timer for the handler
  console.time('Handler Execution Time');

  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // If preflight was handled, exit early

  try {
    if (req.method === 'GET') {
      // Fetch all clients from the database
      console.time('Fetch Clients from Database');
      const clients = await withTimeout(prisma.client.findMany(), TIMEOUT_LIMIT);
      console.timeEnd('Fetch Clients from Database');

      // Fetch actuations from Redis for each client and add it to the results
      console.time('Fetch Actuations from Redis');
      const clientsWithActuations = await Promise.all(
        clients.map(async (client) => {
          if (!client.cuid) return { ...client, actuations: 0 }; // Default to 0 if no `cuid`
          try {
            const actuations = await withTimeout(getRequestCount(client.cuid), TIMEOUT_LIMIT);
            return {
              ...client,
              actuations, // Add the actuations key
            };
          } catch (error) {
            console.error(`Error fetching actuations for cuid ${client.cuid}:`, error.message);
            return { ...client, actuations: 0 }; // Fallback to 0 if an error occurs
          }
        })
      );
      console.timeEnd('Fetch Actuations from Redis');

      // Return the clients with actuations or an empty array
      return res.status(200).json(clientsWithActuations || []);
    } else {
      // Handle unsupported methods
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching client data:', error);
    return res.status(500).json({ error: 'Error fetching data from the database' });
  } finally {
    // Ensure the database connection is closed
    console.time('Database Disconnection');
    await prisma.$disconnect();
    console.timeEnd('Database Disconnection');

    // End the handler timer
    console.timeEnd('Handler Execution Time');
  }
}