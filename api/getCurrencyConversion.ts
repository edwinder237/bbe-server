import type { VercelRequest, VercelResponse } from "@vercel/node";
import { corsMiddleware } from "../utils/corsMiddleware";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Ensure CORS is enabled
        await corsMiddleware(req, res);

        // Check if the request is a POST and includes the required body parameter
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        const { amount,baseCurrency,targetCurrency } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: "Invalid request, 'amount' is required and must be a number" });
        }

        // Fetch function that uses the received 'amount'
        const fetchCurrencyConversion = async () => {
            try {
                const response = await fetch(
                    `https://api.exconvert.com/convert?from=${baseCurrency}&to=${targetCurrency}&amount=${amount}&access_key=753d6367-b25de829-ec82cd24-3fd422f9`
                );

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to fetch currency conversion:', error.message);
                throw error;
            }
        };

        // Call the fetch function and send the result
        const data = await fetchCurrencyConversion();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in handler:", error.message);
        return res
            .status(500)
            .json({ error: "Internal Server Error", message: error.message });
    }
}