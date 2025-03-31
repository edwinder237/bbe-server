/**
 * Retrieves and validates the auth's token for Guesty and Hostaway Integrations.
 * @param internal_ID - The client's internal ID.
 * @param needNewToken - Whether a new token is needed.
 * @param integrationType - The integration type.
 * @returns {Promise<{success: boolean, message: string, token?: string}>}
 */

import { isTokenExpired, fetchNewToken, fetchNewHostAwayToken } from './tokenServiceCaching';
import { PrismaClient } from '@prisma/client';
import { getAuthParams } from './types';



const prisma = new PrismaClient();



export default async function getAuth({ internal_ID, needNewToken, integrationType }: getAuthParams) {
    console.time('Token Validation Execution Time');

    try {
        const tokenStatus = await isTokenExpired({internal_ID,integrationType});

        if (tokenStatus.expired || needNewToken) {
            const authKeys = tokenStatus.client;

            if (!authKeys) {
                console.error(`Client data is missing for ID: ${internal_ID}`);
                return { success: false, message: 'Client data is missing, cannot fetch new token' };
            }

            if (integrationType === "hostaway") {
                console.log("skjdjdksjdksdjdj")
                console.log(`Client ID: ${internal_ID} - Hostaway Token expired, fetching new token...`);
                const newToken = await fetchNewHostAwayToken(internal_ID, authKeys);
                console.log(`Client ID: ${internal_ID} - New Hostaway token fetched successfully.`);
                return { success: true, message: 'Hostaway Token refreshed', token: newToken };

            } else if (integrationType === "guesty") {

                console.log(`Client ID: ${internal_ID} - Guesty Token expired, fetching new token...`);
                const newToken = await fetchNewToken(internal_ID, authKeys);
                console.log(`Client ID: ${internal_ID} - New Guesty token fetched successfully.`);
                return { success: true, message: 'Hostaway Token refreshed', token: newToken };
            }
        }

        console.log(`Client ID: ${internal_ID} - Token is valid.`);
        return { success: true, message: 'Token is still valid', token: tokenStatus.token };

    } catch (error) {
        console.error('Token validation error:', error);
        return { success: false, message: `Token validation failed: ${error.message}` };
    } finally {
        await prisma.$disconnect();
        console.timeEnd('Token Validation Execution Time');
    }

  
}