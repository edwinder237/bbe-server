// api/clientData.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../utils/corsMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // If preflight was handled, exit early

const {internal_ID} =req.body
if(internal_ID !=="n/a"){
  try {
    // Handle GET request
    if (req.method === 'POST') {
      const client = await prisma.client.findUnique({
        where: {
          cuid: internal_ID},
          select:{
            name: true
          }
        
      });

      // Check if client exists
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.status(200).json(client);
    } else {
      // Handle method not allowed
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error fetching client data:', error);
    return res.status(500).json({ error: 'Error fetching data from the database' });
  } finally {
    await prisma.$disconnect(); // Close the database connection
  }
}

}