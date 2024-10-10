import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from './corsMiddleware';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Call the CORS middleware
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return; // If preflight was handled, exit early


  try {
    const users = await prisma.Client.findMany();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Re-throw the error or handle it accordingly
  }

}