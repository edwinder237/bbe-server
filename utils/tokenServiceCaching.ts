import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from '../utils/encrypter';
import { fetchNewTokenFromGuesty,fetchNewTokenFromHostaway } from './getNewToken';
import { kv } from '@vercel/kv';

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
 * Generates a cache key for KV storage.
 * @param internal_ID - Client's internal ID.
 * @param type - The type of data (token or Lodgify keys).
 * @returns {string} Cache key.
 */
const getCacheKey = (internal_ID: string, type: 'token' | 'lodgifyKeys'): string =>
  `${type}_${internal_ID}`;

/**
 * Retrieves token from KV or Prisma and validates its expiration.
 * @param internal_ID - The client's internal ID.
 * @returns {Promise<TokenStatus>}
 */
export async function isTokenExpired({ internal_ID, integrationType }: { internal_ID: string; integrationType: string }): Promise<TokenStatus> {
  const cacheKey = getCacheKey(internal_ID, 'token');
  try {
    const cachedToken = await kv.get<{ token: string; expiry: number }>(cacheKey);

    const currentTime = Math.floor(Date.now() / 1000);
    if (cachedToken && currentTime < cachedToken.expiry - 3600) {
   //   console.log(`Token fetched from KV cache for client: ${internal_ID}`);
      return { expired: false, token: decrypt(cachedToken.token) };
    }

    console.log(`Token not found or expired in KV. Checking database for client: ${internal_ID}`);
    const client = await prisma.client.findUnique({
      where: { cuid: internal_ID },
      select: { accessToken: true, tokenExpire: true, clientID: true, clientSecret: true },
    });

    if (!client) {
      throw new Error(`Client not found for ID: ${internal_ID}`);
    }

    if (!client.accessToken || !client.tokenExpire || currentTime >= client.tokenExpire - 3600) {
    //  console.log(`Fetching new token for client: ${internal_ID}`);
    if(integrationType === "hostaway"){
      const newToken = await fetchNewHostAwayToken(internal_ID, {
        clientID: client.clientID,
        clientSecret: client.clientSecret,
      });
      return { expired: false, token: newToken };
    }
    else if(integrationType === "guesty"){
      const newToken = await fetchNewToken(internal_ID, {
        clientID: client.clientID,
        clientSecret: client.clientSecret,
      });
      return { expired: false, token: newToken };
    }
    }

    if (!client.accessToken) {
      throw new Error('Access token not found in database');
    }
    await kv.set(cacheKey, { token: client.accessToken, expiry: client.tokenExpire });
    //console.log(`Token fetched from database for client: ${internal_ID}`);
    return { expired: false, token: decrypt(client.accessToken) };
  } catch (error) {
    console.error('Error checking token expiration:', error);
    throw new Error('Failed to check token expiration.');
  }
}

/**
 * Fetches a new token and updates both KV and Prisma.
 * @param internal_ID - The client's internal ID.
 * @param authKeys - Authentication keys for Guesty.
 * @returns {Promise<string>}
 */
export async function fetchNewToken(internal_ID: string, authKeys: any): Promise<string> {
  try {
    const { access_token, expires_in } = await fetchNewTokenFromGuesty(authKeys);
    const encryptedToken = encrypt(access_token);
    const expiryInSeconds = Math.floor(Date.now() / 1000) + expires_in;

    await prisma.client.update({
      where: { cuid: internal_ID },
      data: { accessToken: encryptedToken, tokenExpire: expiryInSeconds },
    });

    await kv.set(getCacheKey(internal_ID, 'token'), {
      token: encryptedToken,
      expiry: expiryInSeconds,
    });

    console.log(`New token fetched and updated for client: ${internal_ID}`);
    return access_token;
  } catch (error) {
    console.error('Error fetching new token:', error);
    throw new Error('Failed to fetch and update token.');
  }
}

export async function fetchNewHostAwayToken(internal_ID: string, authKeys: any): Promise<string> {
  try {
    const { access_token, expires_in } = await fetchNewTokenFromHostaway(authKeys);
    const encryptedToken = encrypt(access_token);
    const expiryInSeconds = Math.floor(Date.now() / 1000) + expires_in;

    await prisma.client.update({
      where: { cuid: internal_ID },
      data: { accessToken: encryptedToken, tokenExpire: expiryInSeconds },
    });

    await kv.set(getCacheKey(internal_ID, 'token'), {
      token: encryptedToken,
      expiry: expiryInSeconds,
    });

    console.log(`New token fetched and updated for client: ${internal_ID}`);
    return access_token;
  } catch (error) {
    console.error('Error fetching new token:', error);
    throw new Error('Failed to fetch and update token.');
  }
}

/**
 * Retrieves Lodgify keys from KV or Prisma.
 * @param internal_ID - The client's internal ID.
 * @returns {Promise<LodgifyKeysType>}
 */
export async function getLodgifyKeys(internal_ID: string): Promise<LodgifyKeysType> {
  const cacheKey = getCacheKey(internal_ID, 'lodgifyKeys');
  try {
    // Try to get Lodgify keys from KV cache
    const cachedKeys = await kv.get<LodgifyKeysType>(cacheKey);

    // If keys are found in cache and not empty, return them
    if (cachedKeys && cachedKeys.client.ApiKey && cachedKeys.client.AppKey) {
      console.log(`Lodgify keys fetched from KV cache for client: ${internal_ID}`);
      return cachedKeys;
    }

    // Log if keys are missing or incomplete in cache
    console.log(`Lodgify keys not found or incomplete in KV. Fetching from database for client: ${internal_ID}`);

    // Fetch keys from database
    const client = await prisma.client.findUnique({
      where: { cuid: internal_ID },
      select: { ApiKey: true, AppKey: true },
    });

    if (!client) throw new Error(`Client ID: ${internal_ID} not found`);

    // Validate that API and App keys exist
    if (!client.ApiKey || !client.AppKey) {
      throw new Error('Missing Lodgify API keys.');
    }

    // Construct Lodgify keys object
    const lodgifyKeys: LodgifyKeysType = {
      client: {
        ApiKey: client.ApiKey,
        AppKey: client.AppKey,
      },
    };

    // Cache the Lodgify keys for future use
    await kv.set(cacheKey, lodgifyKeys);
    return lodgifyKeys;
  } catch (error) {
    console.error('Error fetching Lodgify keys:', error);
    throw new Error('Failed to fetch Lodgify keys.');
  }
}