// FETCH HANDLE - handles timeout, abort, times functions, 

import { handleFetchParams } from "./types";

export const handleFetch = async ({ fetchUrl, options, action }: handleFetchParams) => {
  const startTime = Date.now();
  // Create an AbortController to cancel the fetch if it takes too long
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  // Merge the AbortController's signal into the user's options
  const fetchOptions = { ...options, signal: controller.signal };

  try {
    const response = await fetch(fetchUrl, fetchOptions);
    const data = await response.json();

    const endTime = Date.now();
    console.info(
      `[${new Date().toISOString()}] Success in action '${action}' - Duration: ${endTime - startTime}ms`
    );

    return data;
    
  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (error.name === "AbortError") {
      console.error(
        `[${new Date().toISOString()}] Fetch timeout (>${10_000}ms) in action '${action}' - Duration: ${duration}ms`
      );
      throw new Error(`Request timed out after 10 seconds`);
    }

    console.error(
      `[${new Date().toISOString()}] Fetch error in action '${action}' - Duration: ${duration}ms:`,
      error.message
    );
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};