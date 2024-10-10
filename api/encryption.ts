import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './corsMiddleware'; 
import { encrypt, decrypt, ENCRYPTION_KEY, IV_LENGTH } from './keys';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // If preflight was handled, exit early

  const encryptedKey = encrypt(req.body?.apiKey);

  // Log the decrypted key for debugging (in production, avoid logging sensitive data)
  console.log("Decrypted Key:", decrypt(encryptedKey));

  // Example: Store the encrypted key in the database (update to match your schema)
  try {
   // const userIntegration = await prisma.client.create({
    //  data: {
     //  name: encryptedKey, // Assuming you want to store the encrypted key
      // // Add other necessary fields as per your model
     // },
    //});
    
    return res.json({
      message: 'Integration stored successfully!',
      //integration: userIntegration,
    });
  } catch (error) {
    console.error("Error storing integration:", error);
   // return res.status(500).json({ error: 'Failed to store integration.' });
  } finally {
    await prisma.$disconnect(); // Ensure the Prisma Client is disconnected after the operation
  }
}