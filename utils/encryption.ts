import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './corsMiddleware'; 
import { encrypt, decrypt, ENCRYPTION_KEY, IV_LENGTH } from './encrypter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; 


  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Safely access the apiKey from the request body
  const { key } = req.body || {};
  if (!key) {
    return res.status(400).json({ error: 'API key is missing.' });
  }

  // Encrypt the API key
  const encryptedKey: string = encrypt(key);

  try {
    const updatedClient = await prisma.client.update({
      where: {
        id: 4, // Specify the client ID to update
      },
      data: {
        ApiKey: encryptedKey,  // Update the encrypted API key
      },
    });
    
    return res.json({
      message: 'Client updated successfully!',
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return res.status(500).json({ error: 'Failed to update client.' });
  } finally {
    await prisma.$disconnect(); // Ensure the Prisma Client is disconnected after the operation
  }
}