export const handleFetch = async (url: string, options: RequestInit, actionName: string) => {
    const startTime = Date.now(); // Capture the start time

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Check for HTTP errors
        if (!response.ok) {
            if(url === "https://booking.guesty.com/api/reservations/quotes"){
                return data.error.code;
            }else
            throw new Error(`Error in action '${actionName}': ${response.status} ${response.statusText}`);
        }


        const endTime = Date.now(); // Capture the end time
        const duration = endTime - startTime; // Calculate duration

        console.info(`[${new Date().toISOString()}] Success in action '${actionName}' - Duration: ${duration}ms`);

        return { success: true, data };
    } catch (error) {
        const endTime = Date.now(); // Capture end time for error logs
        const duration = endTime - startTime; // Calculate duration

        console.error(`[${new Date().toISOString()}] Fetch error in action '${actionName}' - Duration: ${duration}ms:`, error.message);

        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
};