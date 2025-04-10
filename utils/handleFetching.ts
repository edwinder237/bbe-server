import { da } from "date-fns/locale";
import { handleFetchParams } from "./types";
import { startsWith } from "lodash";
export const handleFetch = async ({ fetchUrl, options, action }: handleFetchParams) => {
    const startTime = Date.now(); // Capture the start time

    try {
        const response = await fetch(fetchUrl, options);

        // Check for 429 status first
        if (response.status === 429) {
            // Handle "Too Many Requests"
            throw new Error("Too Many Requests (429). The rate limit has been exceeded.");
        }

        const data = await response.json();

        if(startsWith(fetchUrl,"https://checkout.lodgify.com/api/v1/checkout/price?propertyId")){
            if (response.status === 400) {
                return { success: true, data:data.title || response.statusText };
            }
        }
          
        // Handle other non-OK statuses
        if (!response.ok) {
            throw new Error(`FETCH_HANDLER - failed with status ${data?.status} - ${data?.message}`);
        }
// LODGIFY ERRORS

        if (response.status === 400) {
            throw new Error(`Error ${response.status}: ${data.title || response.statusText}`);
        }

        //lodgify quote
        if (response.status === 400) {
            throw new Error(`Error ${response.status}: ${data.title || response.statusText}`);
        }

        // Check for HTTP errors
        if (!response.ok) {
            if (fetchUrl === "https://booking.guesty.com/api/reservations/quotes") {
                return data.error.code;
            } else
                throw new Error(`Error in HANDLE FETCH UTIL '${action}': ${response.status} ${response.statusText} - message: ${data?.message}`);
        }


        const endTime = Date.now(); // Capture the end time
        const duration = endTime - startTime; // Calculate duration

        console.info(`[${new Date().toISOString()}] Success in action '${action}' - Duration: ${duration}ms`);

        return { success: true, data };
    } catch (error) {
        const endTime = Date.now(); // Capture end time for error logs
        const duration = endTime - startTime; // Calculate duration

        console.error(`[${new Date().toISOString()}] Fetch error in action '${action}' - Duration: ${duration}ms:`, error.message);

        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
};