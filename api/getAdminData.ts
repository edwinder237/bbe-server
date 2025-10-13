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
      console.log("req.method : GET", req.query);
      const clientCuid = req.query.clientCuid as string | undefined;
      const action = req.query.action as string | undefined;

      /**
       * GET /api/getAdminData?clientCuid=123&action=listings
       * 
       * Fetches all listings (id and title only) for a specific client.
       * 
       * Query Parameters:
       * - clientCuid: The client ID (integer)
       * - action: Must be "listings"
       * 
       * Returns: Array of {id: string, title: string} objects
       * 
       * Process:
       * 1. Validates client exists in database
       * 2. Gets client's integration type (Guesty/Lodgify/Hostaway)
       * 3. Calls controller API to fetch listings from external integration
       * 4. Filters response to return only id and title fields
       */
      if (action === 'listings' && clientCuid && !isNaN(parseInt(clientCuid))) {
        const clientCuid_int = parseInt(clientCuid);
        console.log(`[${new Date().toISOString()}] Fetching listings for clientCuid:`, clientCuid_int);

        // Step 1: Get client data from database to determine integration type
        const client = await withTimeout(
          prisma.client.findUnique({
            where: { id: clientCuid_int },
            include: { integration: true } // Include integration details
          }),
          TIMEOUT_LIMIT
        );

        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }

        if (!client.integration?.title || !client.cuid) {
          return res.status(400).json({ error: 'Client integration or cuid not configured' });
        }

        try {
          // Step 2: Call controller API to fetch listings from external integration
          // The controller handles Guesty, Lodgify, and Hostaway integrations
          const controllerResponse = await fetch(`${req.headers.origin || ''}/api/controller`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: `get${client.integration.title.charAt(0).toUpperCase() + client.integration.title.slice(1)}_Listings`, // e.g., "getGuesty_Listings"
              internal_ID: client.cuid, // Client's unique ID for the integration
              params: { limit: 1000 } // Get all available listings
            })
          });

          if (!controllerResponse.ok) {
            throw new Error(`Controller request failed: ${controllerResponse.status}`);
          }

          const listingsData = await controllerResponse.json();
          
          // Step 3: Extract only id and title from the full listing objects
          const simplifiedListings = listingsData.items?.map((listing: any) => ({
            id: listing.id || listing.internal_ID, // Some integrations use different ID fields
            title: listing.title || listing.name || '' // Some integrations use 'name' instead of 'title'
          })) || [];

          return res.status(200).json(simplifiedListings);
        } catch (error) {
          console.error(`Error fetching listings for client ${clientCuid_int}:`, error);
          return res.status(500).json({ error: 'Failed to fetch listings' });
        }
      }

      // If clientCuid is provided and is a valid number
      if (clientCuid && !isNaN(parseInt(clientCuid))) {
        const clientCuid_int = parseInt(clientCuid);
        console.log(`[${new Date().toISOString()}] Fetching single client data, clientCuid:`, clientCuid_int);

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

      // If no clientCuid or invalid number, fetch all clients
      console.log(`[${new Date().toISOString()}] Fetching all clients`);
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
      console.log("req.method : POST", req.query);
      const { email, name, integrationId, apikey, clientID, clientSecret } = req.body;
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
              ApiKey: apikey,
              clientID: clientID,
              clientSecret: clientSecret,
              AppKey: "6Y8NfnB4VT8rsnPaPoS3FnuutAqwrAAIRRooqIgXEK1t7WelINdPJL4GLnUbwj4j6HUzB3gJp/7FT9/v",
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
      console.log("req.method : DELETE", req.query);
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
    else if (req.method === 'PUT') {
      const { clientCuid, data } = req.body;
      const { name, email, ApiKey, clientID, clientSecret, preferences, status } = data;
      console.log("req.method : PUT", status);

      console.log(`[${new Date().toISOString()}] Updating client:`, { clientCuid, name, email });

      // Validate required fields
      if (!clientCuid) {
        console.warn(`[${new Date().toISOString()}] Missing clientCuid for update`);
        return res.status(400).json({
          error: 'Missing required field: clientCuid'
        });
      }

      try {
        console.log("preferences",preferences);
        console.time('Client Update');
        const updatedClient = await withTimeout(
          prisma.client.update({
            where: { id: parseInt(clientCuid) },
            data: {
              ...(name && { name }),
              ...(email && { email }),
              ...(ApiKey && { ApiKey }),
              ...(clientID && { clientID }),
              ...(clientSecret && { clientSecret }),
              ...(status && { status }),
              ...(preferences && { preferences })
            }
          }),
          TIMEOUT_LIMIT
        );
        console.timeEnd('Client Update');

        console.log(`[${new Date().toISOString()}] Client updated successfully:`, {
  updatedClient
        });

        return res.status(200).json(updatedClient);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error updating client:`, error);
        if (error instanceof Error && error.message.includes('Record to update not found')) {
          return res.status(404).json({ error: 'Client not found' });
        }
        throw error; // Let the main error handler deal with other errors
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