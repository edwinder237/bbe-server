import type { VercelRequest, VercelResponse } from "@vercel/node";
import { corsMiddleware } from "../utils/corsMiddleware";
import getAuth from "../utils/getAuth";
import { handleFetch } from "../utils/handleFetching";


import { getLodgifyKeys } from "../utils/tokenServiceCaching";

import {
    GuestyConverter,
    client_listing_detail_Converter,
    ListingConverter,
    client_lodgiy_listing_detail_Converter,
    client_lodgiy_listing_info_Converter,
    client_lodgiy_listing_detail_V2_Converter,
    //listing_quote_client
} from "../utils/clientConverter";

import {
    lodgify_listings,
    guesty_listings,
    guesty_listing_details,
    Lodgify_Listing_Details,
    Property_info_by_Id_includeInOut,
    Room_info_in_a_property_by_id,
    lodgify_quote_beta


} from "../utils/types";
import dayjs from "dayjs"



// Convert each listing to Client Requirement
//   const convertedListings = data.map((listing: lodgify_listings) => {
//     const converter = new ListingConverter(listing);
//   return converter.convert();
// });

//const convertedListings = (responseData: Lodgify_Listing_Details) => 
//  new client_lodgiy_listing_detail_Converter(responseData).convert();
//const detailsPage = convertedListings(responseData)


interface ParamsListingDetailsType {
    listingId: string;
    quote?: {
        guestsCount?: number; // Required
        checkInDateLocalized?: string; // Required
        checkOutDateLocalized?: string; // Required
        coupons?: string; // Optional
    };
    availabilities: {
        // Optional
        fromDate: string;
        toDate: string;
    };
}

interface ParamsQuoteType {
    listingId: string;
    quote: {
        guestsCount: number; // Required
        checkInDateLocalized: string; // Required
        checkOutDateLocalized: string; // Required
        coupons?: string; // Optional
    };
}

interface ParamsAvailabilitiesType {
    listingId: string; // Required
    availabilities: {
        // Required
        fromDate: string;
        toDate: string;
    };
}

interface keysType {
    appKey?: string; // Required
    apiKey?: string; // Required
}

// Helper function to fetch data
const fetchGuestyData = async (url: string, token: string, action: string) => {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
        },
    };

    const response = await handleFetch(url, options, action);
    if (!response.success) {
        throw new Error(`Failed to fetch data from ${action}: ${response.message}`);
    }
    return response.data;
};

const fetchLodgifyData = async (
    url: string,
    keys: keysType,
    action: string
) => {
    const { appKey, apiKey } = keys;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            "X-ApiKey": apiKey || "",
            "X-App-Key": appKey || "",
        },
    };

    const response = await handleFetch(url, options, action);
    if (!response.success) {
        throw new Error(`Failed to fetch data from ${action}: ${response.message}`);
    }
    return response.data;
};
// Define your routes with robust error handling
const routes = {
    fetchGuestyListings: async (token: string) =>
        fetchGuestyData(
            "https://booking.guesty.com/api/listings",
            token,
            "fetchGuestyListings"
        ),
    fetchGuestyCities: async (token: string) =>
        fetchGuestyData(
            "https://booking.guesty.com/api/listings/cities",
            token,
            "fetchGuestyCities"
        ),
    fetchGuestyListingDetails: async (listingId: string, token: string) =>
        fetchGuestyData(
            `https://booking.guesty.com/api/listings/${listingId}`,
            token,
            "fetchGuestyListingDetails"
        ),
    fetchGuestyListingReviews: async (listingId: string, token: string) =>
        fetchGuestyData(
            `https://booking.guesty.com/api/reviews?listingId=${listingId}`,
            token,
            "fetchGuestyListingReviews"
        ),
    fetchGuestyListingQuote: async (token: string, params: ParamsQuoteType) => {
        const url = "https://booking.guesty.com/api/reservations/quotes";
        const options = {
            method: "POST",
            headers: {
                accept: "application/json; charset=utf-8",
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                guestsCount: params.quote.guestsCount,
                checkInDateLocalized: params.quote.checkInDateLocalized,
                checkOutDateLocalized: params.quote.checkOutDateLocalized,
                listingId: params.listingId,
                coupons: params.quote.coupons,
            }),
        };

        const response = await handleFetch(url, options, "fetchGuestyListingQuote");

        if (!response.success) {
            throw new Error(
                `Failed to fetch GuestyListingQuote: ${response.message}`
            );
        }

        return response.data;
    },
    fetchGuestyListingAvailabilities: async (
        token: string,
        params: ParamsAvailabilitiesType
    ) => {
        const { listingId, availabilities } = params;
        const { fromDate, toDate } = availabilities;
        return fetchGuestyData(
            `https://booking.guesty.com/api/listings/${listingId}/calendar?from=${fromDate}&to=${toDate}`,
            token,
            "fetchGuestyListingAvailabilities"
        );
    },
};

const routesLodgify = {
    fetchLodgifyListings: async (keys: keysType, params?: any) =>
        fetchLodgifyData(
            `https://api.lodgify.com/v2/properties?includeCount=${true}&includeInOut=${true}&page=1&size=${50}`,
            keys,
            "fetchLodgifyListings"
        ),
    fetchLodgifyListingsBETA: async () => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",


                //must be changed
                "Accept-Language": "En",
                //must be changed
                "Origin": "https://goldstarvacation.lodgify.com",
                //must be changed
                "Referer": "https://goldstarvacation.lodgify.com",


                "Sec-CH-UA": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                "Sec-CH-UA-Mobile": "?0",
                "Sec-CH-UA-Platform": '"macOS"',
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-site",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                "Priority": "u=1, i"
            },
            // Add an empty body if needed
            body: JSON.stringify({}),
        };

        try {
            const response = await fetch("https://api.lodgify.com/v2/search/311391", options);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching Lodgify listings:", error);
            throw error;
        }
    }
    ,
    fetchLodgifyListingDetails: async (keys: keysType, params: any) =>
        fetchLodgifyData(
            `https://api.lodgify.com/v1/properties/${params.listingId}?includeInOut=true`,
            keys,
            "fetchLodgifyListingDetails"
        ),
    fetchLodgifyListingDetailsBETA: async (keys: keysType, params: any) =>
        fetchLodgifyData(
            `https://checkout.lodgify.com/api/v1/checkout/property/${parseInt(params.listingId)}`,
            keys,
            "fetchLodgifyListingDetailsBETA"
        ),
    fetchLodgifyListingInfo: async (keys: keysType, roomId: number, params?: any) =>{
        return fetchLodgifyData(
            `https://api.lodgify.com/v1/properties/${310932}/rooms/${375943}`,
            keys,
            "fetchLodgifyListingInfo"
        )},
    fetchLodgifyListingQuoteBeta: async (keys: keysType, params?: any) => {
        const { listingId, quote, lodgifyParams } = params;
        const {
            checkInDateLocalized,
            checkOutDateLocalized,
            guestsCount,
            currency,
        } = quote;

        return fetchLodgifyData(
            `https://checkout.lodgify.com/api/v1/checkout/price?propertyId=${listingId}&arrival=${checkInDateLocalized}&departure=${checkOutDateLocalized}&guests=${guestsCount}&currency=${currency}`,
            keys,
            "fetchLodgifyListingQuoteBeta"
        );
    },


    fetchLodgifyListingAvailabilities: async (keys: keysType, params?: any) => {
        const { listingId, availabilities } = params;
        const { fromDate, toDate } = availabilities;
        const fromDateISO = dayjs(fromDate).toISOString();
        const toDateISO = dayjs(toDate).toISOString();
        return fetchLodgifyData(
            `https://api.lodgify.com/v1/availability/${listingId}?periodStart=${fromDateISO}&periodEnd=${toDateISO}`,
            keys,
            "fetchLodgifyListingAvailabilities"
        )
    },

    fetchLodgifyListingsDates: async (keys: keysType, params?: any) => {
        const { availabilities } = params;
        const { fromDate, toDate } = availabilities;
        const fromDateISO = dayjs(fromDate).toISOString();
        const toDateISO = dayjs(toDate).toISOString();
        return fetchLodgifyData(
            `https://api.lodgify.com/v1/availability?periodStart=${fromDateISO}&periodEnd=${toDateISO}`,
            keys,
            "fetchLodgifyListingsDates"
        )
    }



};

// Utility actions for handling API data and fetchToken
const actions = {
    getGuesty_Listings: async (internal_ID: string) => {
        const tokenResponse = await getAuth(internal_ID, false);
        if (!tokenResponse.success) {
            throw new Error(`Token validation failed: ${tokenResponse.message}`);
        }

        const token = tokenResponse.token;
        if (!token) {
            throw new Error("Token is undefined");
        }

        try {
            const [listings, cities] = await Promise.all([
                routes.fetchGuestyListings(token),
                routes.fetchGuestyCities(token),
            ]);

            const coverted_listings = listings.results.map((listing: guesty_listings) => new GuestyConverter(listing).convert());

            return { coverted_listings, cities }; // Return listings and cities only
        } catch (error) {
            console.error("Error fetching listings or cities:", error.message);
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },

    getGuesty_ListingDetails: async (
        internal_ID: string,
        params: ParamsListingDetailsType
    ) => {
        const { listingId } = params;
        const tokenResponse = await getAuth(internal_ID, false);
        if (!tokenResponse.success) {
            throw new Error(`Token validation failed: ${tokenResponse.message}`);
        }

        const token = tokenResponse.token;
        if (!token) {
            throw new Error("Token is undefined");
        }

        try {
            // Fetch listing details and reviews
            const [listingDetails, reviews] = await Promise.all([
                routes.fetchGuestyListingDetails(listingId, token),
                routes.fetchGuestyListingReviews(listingId, token),
            ]);

            // Fetch quote if quote parameters are provided
            let quote;
            const {
                guestsCount,
                checkInDateLocalized,
                checkOutDateLocalized,
                coupons,
            } = params.quote || {};

            if (
                guestsCount !== undefined &&
                checkInDateLocalized &&
                checkOutDateLocalized
            ) {
                try {
                    quote = await routes.fetchGuestyListingQuote(token, {
                        listingId,
                        quote: {
                            guestsCount,
                            checkInDateLocalized,
                            checkOutDateLocalized,
                            coupons,
                        },
                    });
                } catch (error) {
                    console.error("Error fetching quote:", error.message);
                    quote = { message: "Quote not available for this request" }; // Handle quote fetching error
                }
            }
            // Convert listing to Client Requirement
            const listing = new client_listing_detail_Converter(listingDetails);
            const singleListing = listing.convert();
            return { singleListing, reviews, quote }; // Return listing details, reviews, and quote
        } catch (error) {
            console.error(
                "Error fetching listing details or reviews:",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },
    getGuesty_ListingAvailabilities: async (internal_ID: string, params: ParamsAvailabilitiesType) => {
        const tokenResponse = await getAuth(internal_ID, false);
        if (!tokenResponse.success) {
            throw new Error(`Token validation failed: ${tokenResponse.message}`);
        }
        const { listingId } = params;

        const token = tokenResponse.token;
        if (!token) {
            throw new Error("Token is undefined");
        }

        try {
            const [availabilities] = await Promise.all([
                routes.fetchGuestyListingAvailabilities(token, params),
            ]);

            const disabledDatesOnly = availabilities.filter((date) => date.status !== "available")
            return { propertyId: listingId, disabledDatesOnly };
        } catch (error) {
            console.error("Error fetching listings or cities:", error.message);
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },

    //////////////LODGIFY///////////////////////////////////////////

    getLodgify_Listings: async (internal_ID: string) => {
        const keys = await getLodgifyKeys(internal_ID);

        const { ApiKey, AppKey } = keys.client;

        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        }
        const keysObject: keysType = { appKey: AppKey, apiKey: ApiKey };

        try {
            const [listings, additionalData] = await Promise.all([
                routesLodgify.fetchLodgifyListings(keysObject),
                routesLodgify.fetchLodgifyListingsBETA(),

            ]);

            const coverted_listings = listings.items.filter((lst) => lst.is_active).map((listing: lodgify_listings) => new ListingConverter(listing).convert());
            const cities = {
                results: coverted_listings.map((i) => ({
                    city: i.address.city,
                    state: i.address.state,
                    country: i.address.country
                }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) =>
                            t.city === value.city && t.state === value.state
                        )
                    )

            }
            const listingExtraData = additionalData.data.items
            return { coverted_listings, cities, listingExtraData }; // Return listings and cities only
        } catch (error) {
            console.error("Error fetching listings or cities:", error.message);
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },

    getLodgify_Listings_search: async (internal_ID: string, params: ParamsAvailabilitiesType) => {
        const keys = await getLodgifyKeys(internal_ID);



        const { ApiKey, AppKey } = keys.client;

        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        }
        const keysObject: keysType = { appKey: AppKey, apiKey: ApiKey };

        try {
            const [AvailableListings, listings] = await Promise.all([
                //Fectch Availabilities and pass search params
                routesLodgify.fetchLodgifyListingsDates(keysObject, params),
                //run fetchLodgifyListings and 
                routesLodgify.fetchLodgifyListings(keysObject),

            ]);
            const { fromDate, toDate } = params.availabilities;

            const START = dayjs(fromDate).format('YYYY-MM-DD');
            const END = dayjs(toDate).format('YYYY-MM-DD');

            // Step 1: Filter AvailableListings directly for properties bookable within selected dates
            const availableIds = new Set(
                AvailableListings
                    .filter(listing => listing.is_available && listing.period_start === START && listing.period_end === END)
                    .map(listing => listing.property_id)
            );

            // Step 2: Convert listings to FRONTEND format and filter active listings in one pass
            const filteredListings = listings.items.reduce((acc, lst) => {
                if (lst.is_active && availableIds.has(lst.id)) {
                    acc.push(new ListingConverter(lst).convert());
                }
                return acc;
            }, []);
            console.log(fromDate, toDate)
            console.log(availableIds)

            const cities = {
                results: filteredListings.map((i) => ({
                    city: i.address.city,
                    state: i.address.state,
                    country: i.address.country
                }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) =>
                            t.city === value.city && t.state === value.state
                        )
                    )

            }
            return { filteredListings };
        } catch (error) {
            console.error("Error fetching listings or cities:", error.message);
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },

    getLodgify_ListingDetails: async (
        internal_ID: string,
        params: ParamsListingDetailsType
    ) => {
        const keys = await getLodgifyKeys(internal_ID);

        const { ApiKey, AppKey } = keys.client;

        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        }
        const keysObject: keysType = { appKey: AppKey, apiKey: ApiKey };
        try {
            // Fetch listing details and reviews
            const [listingDetails, availabilities] = await Promise.all([
                routesLodgify.fetchLodgifyListingDetails(keysObject, params),
                routesLodgify.fetchLodgifyListingAvailabilities(keysObject, params),
            ]);
            const roomId = listingDetails?.rooms?.[0]?.id;
            const info = await routesLodgify.fetchLodgifyListingInfo(keysObject, roomId, params);
            // Fetch quote if quote parameters are provided
            let quote;
            const {
                guestsCount,
                checkInDateLocalized,
                checkOutDateLocalized,
                coupons,
            } = params.quote || {};

            if (
                guestsCount !== undefined &&
                checkInDateLocalized &&
                checkOutDateLocalized
            ) {
                try {
                    quote = await routesLodgify.fetchLodgifyListingQuoteBeta(keysObject, params)
                } catch (error) {
                    console.error("Error fetching quote:", error.message);
                    quote = { message: "Quote not available for this request" }; // Handle quote fetching error
                }
            }
            // Convert listing to Client Requirement

            const listing = new client_lodgiy_listing_detail_V2_Converter(listingDetails as Property_info_by_Id_includeInOut);
            const Info = new client_lodgiy_listing_info_Converter(info as Room_info_in_a_property_by_id);
            const listing_info = Info.convert()
            const singleListingObject = listing.convert();
            const singleListing = { ...singleListingObject, ...listing_info }

            return { singleListing, availabilities, quote,singleListingObject };
        } catch (error) {
            console.error(
                "Error fetching listing details :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },
};

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Validate CORS
    const isPreflight = corsMiddleware(req, res);
    if (isPreflight) return;

    try {
        const { action, internal_ID, params } = req.body;

        if (action?.startsWith("getGuesty")) {
            const actionName = action as keyof typeof actions;

            if (actions[actionName]) {
                const actionResults = await actions[actionName](internal_ID, params);
                return res.status(200).json(actionResults);
            } else {
                return res.status(400).json({ error: "Invalid Guesty action" });
            }
        }
        if (action?.startsWith("fetchLodgify")) {

            const keys = await getLodgifyKeys(internal_ID);
            const { ApiKey, AppKey } = keys.client;

            if (!ApiKey || !AppKey) {
                return res.status(400).json({ error: "Missing Lodgify API keys" });
            }
            const fetchName = action as keyof typeof routesLodgify;

            // Check against routesLodgify, not routes
            if (routesLodgify[fetchName]) {
                const keysObject: keysType = { appKey: AppKey, apiKey: ApiKey };
                const params = req.body.params || {};
                try {
                    const fetchResults = await routesLodgify[fetchName](
                        keysObject,
                        params
                    ); // Use routesLodgify
                    return res.status(200).json(fetchResults);
                } catch (error) {
                    console.error("Error fetching Lodgify data:", error.message);
                    return res.status(500).json({
                        error: "Failed to fetch Lodgify data",
                        message: error.message,
                    });
                }
            } else {
                return res.status(400).json({ error: "Invalid Lodgify action" });
            }
        } else if ((action?.startsWith("getLodgify"))) {

            const fetchName = action as keyof typeof routesLodgify;
            if (actions[fetchName]) {

                try {
                    const fetchResults = await actions[fetchName](internal_ID,
                        params
                    );
                    return res.status(200).json(fetchResults);
                } catch (error) {
                    console.error("Error fetching Lodgify data:", error.message);
                    return res.status(500).json({
                        error: "Failed to fetch Lodgify data",
                        message: error.message,
                    });
                }
            } else {
                return res.status(400).json({ error: "Invalid Lodgify action" });

            }



        } else if (routes[action]) {
            const tokenResponse = await getAuth(internal_ID, false);
            if (!tokenResponse.success) {
                console.error(`Token validation failed: ${tokenResponse.message}`);
                return res.status(401).json({ error: tokenResponse.message });
            }

            const params = req.body.params || {}; // Ensure params are passed
            const actionResults = await routes[action](tokenResponse.token, params);
            return res.status(200).json(actionResults);
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }
    } catch (error) {
        console.error("Error in handler:", error.message);
        return res
            .status(500)
            .json({ error: "Internal Server Error", message: error.message });
    }
}
