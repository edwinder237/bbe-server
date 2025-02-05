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
      // Check if a specific client ID is requested
      const clientCuid = req.query.clientCuid as string;
      const clientCuid_int = parseInt(clientCuid);
      console.log(`[${new Date().toISOString()}] Fetching clients data, clientCuid:`, clientCuid_int);
      if (clientCuid_int) {
        console.time('Fetch Single Client');
        const client = await withTimeout(
          prisma.client.findUnique({
            where: { id: clientCuid_int }
          }), 
          TIMEOUT_LIMIT
        );
        console.timeEnd('Fetch Single Client');

        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }

        // Fetch actuations for the single client
        let actuations = 0;
        if (client.cuid) {
          try {
            actuations = await withTimeout(getRequestCount(client.cuid), TIMEOUT_LIMIT);
          } catch (error) {
            console.error(`Error fetching actuations for cuid ${client.cuid}:`, error.message);
          }
        }

        return res.status(200).json({ ...client, actuations });
      }

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
    } 
    else if (req.method === 'POST') {
      const { email, name, integrationId,apikey } = req.body;
      console.log(`[${new Date().toISOString()}] Creating new client:`, { email, name, integrationId });

      // Validate required fields
      if (!email || !name || !integrationId) {
        console.warn(`[${new Date().toISOString()}] Invalid client data:`, { email, name, integrationId });
        return res.status(400).json({ 
          error: 'Missing required fields: email, name, integrationId' 
        });
      }

      try {
        console.time('Client Creation');
        const newClient = await withTimeout(
          prisma.client.create({
            data: {
              email,
              name,
              integrationId,
              cuid: crypto.randomUUID(),
              ApiKey: apikey ,
              AppKey: "6Y8NfnB4VT8rsnPaPoS3FnuutAqwrAAIRRooqIgXEK1t7WelINdPJL4GLnUbwj4j6HUzB3gJp/7FT9/v" ,
              channelID: '',
            }
          }),
          TIMEOUT_LIMIT
        );
        console.timeEnd('Client Creation');
        console.log(`[${new Date().toISOString()}] Client created successfully:`, { 
          id: newClient.id, 
          email: newClient.email,
          name: newClient.name 
        });

        return res.status(201).json(newClient);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error creating client:`, error);
        throw error; // Let the main error handler deal with it
      }
    } 
    else if (req.method === 'DELETE') {
      const clientCuid = req.query.cuid as string; // Extract client ID from query parameters
      
      console.log(`[${new Date().toISOString()}] Deleting client with ID:`, clientCuid);

      // Validate client ID
      if (!clientCuid) {
        console.warn(`[${new Date().toISOString()}] Missing client cuid for deletion`);
        return res.status(400).json({ 
          error: 'Missing required field: clientId' 
        });
      }

      try {
        console.time('Client Deletion');
        const deletedClient = await withTimeout(
          prisma.client.delete({
            where: {
              cuid: clientCuid
            }
          }),
          TIMEOUT_LIMIT
        );
        console.timeEnd('Client Deletion');
        
        console.log(`[${new Date().toISOString()}] Client deleted successfully:`, { 
          id: deletedClient.id, 
          email: deletedClient.email,
          name: deletedClient.name 
        });

        return res.status(200).json({ 
          message: 'Client deleted successfully',
          client: deletedClient 
        });
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error deleting client:`, error);
        throw error; // Let the main error handler deal with it
      }
    }
    else {
      // Handle unsupported methods
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  } finally {
    // Ensure the database connection is closed
    console.time('Database Disconnection');
    await prisma.$disconnect();
    console.timeEnd('Database Disconnection');

    // End the handler timer
    console.timeEnd('Handler Execution Time');
  }
}