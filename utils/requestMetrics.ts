import redis from '../utils/upstash_metrics';

/**
 * Increment the request count for a specific internal_ID.
 */
export async function incrementRequestCount(internal_ID: string): Promise<void> {
  try {
    const requestCountKey = `request_count:${internal_ID}`;
    await redis.incr(requestCountKey);
  } catch (error) {
    console.error(`Error incrementing request count for ${internal_ID}:`, error.message);
  }
}

/**
 * Get the request count for a specific internal_ID.
 */
export async function getRequestCount(internal_ID: string): Promise<number> {
    try {
      const requestCountKey = `request_count:${internal_ID}`;
      const count = await redis.get(requestCountKey);
  
      // Ensure count is treated as a string before passing to parseInt
      return parseInt((count as string) || '0', 10);
    } catch (error) {
      console.error(`Error fetching request count for ${internal_ID}:`, error.message);
      return 0;
    }
  }