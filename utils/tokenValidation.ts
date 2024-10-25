import { isTokenExpired, fetchNewToken } from './tokenServiceCaching';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export default async function tokenValidator( internal_ID, needNewToken ) {
  console.time('Token Validation Execution Time');
  
  try {
    const tokenStatus = await isTokenExpired(internal_ID);

    if (tokenStatus.expired || needNewToken) {
      const authKeys = tokenStatus.client;
      if (!authKeys) {
        console.error(`Client data is missing for ID: ${internal_ID}`);
        return { success: false, message: 'Client data is missing, cannot fetch new token' };
      }

      console.log(`Client ID: ${internal_ID} - Token expired, fetching new token...`);
      const newToken = await fetchNewToken(internal_ID, authKeys);

      console.log(`Client ID: ${internal_ID} - New token fetched successfully.`);
      return { success: true, message: 'Token refreshed', newToken };
    } 

    console.log(`Client ID: ${internal_ID} - Token is valid.`);
    return { success: true, message: 'Token is still valid', token: tokenStatus.token };
    
  } catch (error) {
    console.error('Token validation error:', error);
    return { success: false, message: 'Token validation failed: ' + error.message };
  } finally {
    await prisma.$disconnect();
    console.timeEnd('Token Validation Execution Time');
  }
}