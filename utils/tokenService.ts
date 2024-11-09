import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from '../utils/encrypter';
import { fetchNewTokenFromGuesty } from './getNewToken';




const prisma = new PrismaClient();

interface Client {
  accessToken: string | null;
  tokenExpire: number | null;
  clientID: string | null;
  clientSecret: string | null;
}

interface TokenStatus {
  expired: boolean;
  token?: string;
  client?: Client;
}

interface LodgifyKeysType {
  client: {
    ApiKey: string;
    AppKey: string;
  };
}

/**
 * Checks if the stored token is expired for a client.
 * @param internal_ID - The ID stored in the Database
 * @returns {Promise<TokenStatus>} - Object with `expired` status and decrypted `token` if valid.
 */
export async function isTokenExpired(internal_ID: string): Promise<TokenStatus> {
  //console.log('Fetching encrypted token from DB', internal_ID);
  
  try {
    const client = await prisma.client.findUnique({
      where: { cuid: internal_ID },
      select: {
        accessToken: true,
        tokenExpire: true,
        clientID: true,
        clientSecret: true,
      },
    });

    if (!client) {
      console.error(`Client with ID ${internal_ID} not found`);
      throw new Error(`Client ID: ${internal_ID} not found`);
    }

    if (!client.accessToken || !client.tokenExpire) {
      console.warn('Missing token or expiration data:', internal_ID);
      return { expired: true, client };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime >= client.tokenExpire - 3600; // 1-hour buffer

    return isExpired
      ? { expired: true, client }
      : { expired: false, token: decrypt(client.accessToken), client };
  } catch (error) {
    console.error('Error checking token expiration:', error);
    throw new Error('Failed to check token expiration.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function fetchNewToken(internal_ID: string, authKeys: any): Promise<string> {
  try {
    const { access_token, expires_in } = await fetchNewTokenFromGuesty(authKeys);
    const encryptedKey = encrypt(access_token);
    const expiryInSeconds = Math.floor(Date.now() / 1000) + expires_in;

   // console.log('Updating DB with encrypted token and expiry');
    await prisma.client.update({
      where: { cuid: internal_ID },
      data: {
        accessToken: encryptedKey,
        tokenExpire: expiryInSeconds,
      },
    });

   // console.log('DB updated with encrypted token');
    return access_token;
  } catch (error) {
    console.error('Error fetching new token:', error);
    throw new Error('Failed to fetch and update token.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function getLodgifyKeys(internal_ID: string): Promise<LodgifyKeysType> {
 // console.log('Fetching encrypted Lodgify AuthKeys from DB', internal_ID);
  
  try {
    const client = await prisma.client.findUnique({
      where: { cuid: internal_ID },
      select: {
        ApiKey: true,
        AppKey: true,
      },
    });

    if (!client) {
      console.error(`Client with ID ${internal_ID} not found`);
      throw new Error(`Client ID: ${internal_ID} not found`);
    }

    if (!client.ApiKey || !client.AppKey) {
      console.warn('Missing API or APP key:', internal_ID);
      return {
        client: {
          ApiKey: '',
          AppKey: ''
        }
      };
    }

    return {
      client: {
        ApiKey: client.ApiKey ?? '',
        AppKey: client.AppKey ?? ''
      }
    };
  } catch (error) {
    console.error('Error fetching Lodgify keys:', error);
    throw new Error('Failed to fetch Lodgify keys.');
  } finally {
    await prisma.$disconnect();
  }
}