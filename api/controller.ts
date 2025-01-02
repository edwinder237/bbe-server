import type { VercelRequest, VercelResponse } from "@vercel/node";
import { incrementRequestCount } from "../utils/requestMetrics";
import { corsMiddleware } from "../utils/corsMiddleware";
import getAuth from "../utils/getAuth";
import { handleFetch } from "../utils/handleFetching";
import dayjs from "dayjs"
import { getLodgifyKeys } from "../utils/tokenServiceCaching";
import {
    GuestyConverter,
    client_listing_detail_Converter,
    ListingConverter,
    client_lodgiy_listing_info_Converter,
    LODGIFY_DETAILS_BETA_TO_LISTING_DETAILS_FORMAT,
    LODGIFY_ROOM_INFO_TO_LISTING_DETAILS_FORMAT,
    //listing_quote_client,
    LODGIFY_QUOTE_TO_CLIENT_LISTING_QUOTE,
    GUESTY_QUOTE_TO_CLIENT_LISTING_QUOTE,
    LODGIFY_DETAILS_TO_LISTING_DETAILS_FORMAT
} from "../utils/clientConverter";

import {
    lodgify_listings,
    guesty_listings,
    guesty_listing_details,
    Lodgify_Listing_Details_BETA,
    Property_info_by_Id_includeInOut,
    Room_info_in_a_property_by_id,
    lodgify_quote_beta,
    lodgify_listings_details,
    guesty_quote



} from "../utils/types";



interface LocationType {
    city?: string;
    state?: string;
    country?: string;
}

interface ListingFiltersType {
    location?: LocationType;
    guestsCount?: number
    dateRange?: {
        checkInDateLocalized?: string;
        checkOutDateLocalized?: string;
    }
}

interface ListingsReturnType {
    total: number;
    items: any[];
    error?: string;
    message?: string
}




interface ParamsListingDetailsType {
    default_Lang?: string;
    roomId?: string;
    websiteId?: string
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

interface ParamsReservationType {
    listingId: string;
    reservation: {
        quoteId: string; // Required
        ratePlanID: string; // Required
        ccToken: string; // Required
        guest: {
            firstName: string; // Required
            lastName: string; // Required
            email: string; // Required
            phone: number //optional
        },
        policy: {
            privacy: {
                dateOfAcceptance: Date;
                isAccepted: boolean;
                version: number;
            };
            termsAndConditions: {
                isAccepted: boolean;
                dateOfAcceptance: Date;
            };
            marketing: {
                isAccepted: boolean;
            };
        }
    };
}

interface ParamsPaymentProviderType {
    listingId: string;
}



interface ParamsDatesSearchType {
    listingId: string;
    search: {
        guestsCount?: number
        checkInDateLocalized: string;
        checkOutDateLocalized: string;
        location: LocationType
    };
    lodgifySite:ParamsLodgifySite
}

interface ParamsLodgifySite {
    id: string;
    url: string;
}

interface ParamsAvailabilitiesType {
    default_Lang?: string;
    roomId?: string;
    websiteId?: string
    listingId: string; // Required
    availabilities: {
        // Required
        fromDate: string;
        toDate: string;
    };
}
interface ParamsNextPageType {

    nextPage: string
}

interface keysType {
    appKey: string; // Required
    apiKey: string; // Required
}

interface FetchResponse {
    success: boolean;
    data: any;
    message?: string;
}

interface tokenType {
    appKey: string; // Optional in the interface
    apiKey: string; // Optional in the interface
}

// Helper function to fetch data with timeout
const fetchGuestyData = async (url: string, token: string, action: string): Promise<any> => {
    const options: RequestInit = {
        method: "GET",
        headers: {
            accept: "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
        },

    };
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout fetching data from ${action}`)), 10000) // 10-second timeout
    );
    try {
        const fetchPromise = handleFetch(url, options, action) as Promise<FetchResponse>;
        const response = await Promise.race([fetchPromise, timeout]);
        if (!response.success) {
            throw new Error(`Failed to fetch data from ${action}: ${response.message}`);
        }
        return response.data;
    } catch (error) {
        console.error(`Error in fetchGuestyData: ${error.message}`);
        throw error;
    }

};


// Helper function to fetch Lodgify data with timeout
const fetchLodgifyData = async (
    url: string,
    keys: tokenType, // Use tokenType as the type for keys
    action: string
): Promise<any> => {
    const { appKey, apiKey } = keys;
    const options: RequestInit = {
        method: "GET",
        headers: {
            accept: "application/json",
            "X-ApiKey": apiKey || "", // Ensure these are strings
            "X-App-Key": appKey || "", // Ensure these are strings
        },
    };
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout fetching data from ${action}`)), 10000) // 10-second timeout
    );

    try {
        const fetchPromise = handleFetch(url, options, action) as Promise<FetchResponse>;
        const response = await Promise.race([fetchPromise, timeout]);

        if (!response.success) {
            throw new Error(`Failed to fetch data from ${action}: ${response.message}`);
        }
        return response.data;
    } catch (error) {
        console.error(`Error in fetchLodgifyData: ${error.message}`);
        throw error;
    }
};



// Define your routes with robust error handling

const routes = {
    fetchGuestyListings: async (token: string) => {
        const response = await fetchGuestyData(
            "https://booking.guesty.com/api/listings?numberOfBedrooms=0&numberOfBathrooms=0&limit=60",
            token,
            "fetchGuestyListings"
        )

        return response

    },
    fetchGuestyNextPage: async (token: string, params: ParamsNextPageType) => {
        const { nextPage } = params;

        const response = await fetchGuestyData(
            `https://booking.guesty.com/api/listings?cursor=${nextPage}&limit=9`,
            token,
            "fetchGuestyNextPage"
        )

        const coverted_listings = response.results.map((listing: guesty_listings) => new GuestyConverter(listing).convert());

        return { filteredListings: coverted_listings, pagination: response.pagination.cursor.next };

    },
    fetchGuestyListingsDates: async (token: string, params: ParamsDatesSearchType) => {
        const { location } = params.search || { city: "", state: "", country: "" };
        const { guestsCount, checkInDateLocalized, checkOutDateLocalized } = params.search;
        // Format dates using dayjs
        const checkIn = dayjs(checkInDateLocalized).format("YYYY-MM-DD");
        const checkOut = dayjs(checkOutDateLocalized).format("YYYY-MM-DD");
        // Extract location details
        const city = location.city;
        const state = location?.state;
        const country = location?.country;
        
        const baseUrl: string = "https://booking.guesty.com/api/listings";
        const url_params: string[] = [];

        // Add required parameters in the correct order
        url_params.push(`minOccupancy=${guestsCount}`)
        url_params.push(`numberOfBedrooms=0`);
        url_params.push(`numberOfBathrooms=0`);
       
        // Add optional parameters
        if (city) url_params.push(`city=${encodeURIComponent(city)}`);
        if (country) url_params.push(`country=${encodeURIComponent(country)}`);
        if (state) url_params.push(`state=${encodeURIComponent(state)}`);

        // Add date and limit parameters
        checkInDateLocalized && url_params.push(`checkIn=${encodeURIComponent(checkIn)}`);
        checkOutDateLocalized && url_params.push(`checkOut=${encodeURIComponent(checkOut)}`);
        url_params.push(`limit=60`);

        // Construct the full URL
        const url: string = `${baseUrl}?${url_params.join("&")}`;

        //console.log(`Fetching listings dates with URL: ${url}`);

        // Fetch data using the constructed URL
        const searchResult = await fetchGuestyData(url, token, "fetchGuestyListingsDates");
        
       
        const coverted_listings = searchResult.results.map((listing: guesty_listings) => new GuestyConverter(listing).convert());
        const results:ListingsReturnType = {total:coverted_listings.length, items: coverted_listings}

        return { filteredListings: results };
    },
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
                ...(params.quote?.coupons ? { coupons: params.quote.coupons } : {}), // Only include if coupons exists
            }),
        };

        //handle request made on invalid dates   
        const response = await handleFetch(url, options, "fetchGuestyListingQuote");
       // console.log(response)
        if (response === "LISTING_IS_NOT_AVAILABLE") {
            return {
                code: "LISTING_IS_NOT_AVAILABLE",
                status: 400,
                message: "The selected dates are unavailable. Please choose different dates."
            };
        }
        //handle bad coupon request 
        if (response === "INVALID_COUPON") {
            return {
                code: "INVALID_COUPON",
                status: 400,
                message: "Valid coupons does not match requested coupons"
            };
        }
        if (!response.success) {
            throw new Error(
                `Failed to fetch GuestyListingQuote: ${response.message}`
            );
        }
        const apiQuote = response.data

        //convert API CALL TO FRONT END REQUIREMENT 
        const quote = new GUESTY_QUOTE_TO_CLIENT_LISTING_QUOTE(apiQuote as guesty_quote);
        const CONVERTED_QUOTE = quote.convert();

        return CONVERTED_QUOTE;
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
    fetchGuestyPaymentProviderID: async (token: string, params: ParamsPaymentProviderType) => {

        const response = await fetchGuestyData(
            `https://booking.guesty.com/api/listings/${params.listingId}/payment-provider`,
            token,
            "fetchGuestyPaymentProviderID"
        )

        return response

    },
    fetchGuestyReservation: async (token: string, params: ParamsReservationType) => {
        const { quoteId, ratePlanID, ccToken, guest, policy } = params.reservation;
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout fetching data from ${action}`)), 10000) // 10-second timeout
        );

        const options: RequestInit = {
            method: "POST",
            headers: {
                accept: "application/json; charset=utf-8",
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                guest: { firstName: guest.firstName, lastName: guest.lastName, email: guest.email, phone: guest?.phone },
                ccToken: ccToken,
                ratePlanId: ratePlanID,
                policy: {
                    privacy: { isAccepted: policy.privacy.isAccepted, version: policy.privacy.version, dateOfAcceptance: policy.privacy.dateOfAcceptance },
                    termsAndConditions: { isAccepted: policy.termsAndConditions.isAccepted },
                    marketing: { isAccepted: policy.marketing.isAccepted }
                }
            })

        }
        const url = `https://booking.guesty.com/api/reservations/quotes/${quoteId}/instant`;
        const action = "fetchGuestyReservation"
        try {
            const fetchPromise = handleFetch(url, options, action) as Promise<FetchResponse>;
            const response = await Promise.race([fetchPromise, timeout]);
            if (!response.success) {
                throw new Error(`Failed to fetch data from ${action}: ${response.message}`);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in fetchGuestyData: ${error.message}`);
            throw error;
        }

    },
};

const routesLodgify = {
    fetchLodgifyCurrencies: async (keys: keysType, params?: any) =>
        fetchLodgifyData(
            `https://api.lodgify.com/v2/properties?includeCount=${true}&includeInOut=${true}&page=1&size=${50}`,
            keys,
            "fetchLodgifyListings"
        ),
    fetchLodgifyListings: async (keys: keysType, params?: any) =>
        fetchLodgifyData(
            `https://api.lodgify.com/v2/properties?includeCount=${true}&includeInOut=${true}&page=1&size=${50}`,
            keys,
            "fetchLodgifyListings"
        ),
    fetchLodgifyListingsBETA: async (params) => {
        const { id, url } = params

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",


                //must be changed
                "Accept-Language": "En",
                //must be changed
                "Origin": url,
                //must be changed
                "Referer": url,


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
            const response = await fetch(`https://api.lodgify.com/v2/search/${id}`, options);

            if (!response.ok) {
                throw new Error(`Error Missing lodgify site id and url ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching Lodgify listings:", error);
            throw error;
        }
    },
    fetchLodgifyListingDetails: async (keys: keysType, params: any) =>
        fetchLodgifyData(
            `https://api.lodgify.com/v1/properties/${params.listingId}?includeInOut=false`,
            keys,
            "fetchLodgifyListingDetails"
        ),
    fetchLodgifyListingDetailsBETA: async (keys: keysType, params: any) =>
        fetchLodgifyData(
            `https://checkout.lodgify.com/api/v1/checkout/property/${parseInt(params.listingId)}`,
            keys,
            "fetchLodgifyListingDetailsBETA"
        ),
    fetchLodgifyListingInfo: async (keys: keysType, params: any, RoomId?: any) => {
        const { listingId, websiteId, roomId, default_Lang } = params; // Extract relevant params
        const url = `https://api.lodgify.com/v1/properties/${listingId}/rooms/${RoomId}?wid=${websiteId}`;
        const { appKey, apiKey } = keys;
        const options: RequestInit = {
            method: "GET",
            headers: {
                accept: "application/json",
                "X-ApiKey": apiKey || "", // Ensure these are strings
                "X-App-Key": appKey || "", // Ensure these are strings
                "Accept-Language": default_Lang || "en"
            },
        };

        try {
            // Use handleFetch with the required arguments
            const fetchPromise = handleFetch(url, options, "fetchLodgifyListingInfo") as Promise<FetchResponse>;
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Timeout fetching Lodgify listing info")), 10000) // 10-second timeout
            );

            const response = await Promise.race([fetchPromise, timeout]);
            if (!response.success) {
                throw new Error(`Failed to fetch Lodgify listing info: ${response.message}`);
            }
            return response.data;
        } catch (error) {
            console.error(`Error in fetchLodgifyListingInfo: ${error.message}`);
            throw error;
        }
    },
    fetchLodgifyListingQuoteBeta: async (keys: keysType, params?: any) => {
        const { listingId, quote } = params;
        const { checkInDateLocalized, checkOutDateLocalized, guestsCount, currency } = quote;

        const QuoteData = async () => {
            try {
                const response = await fetch(
                    `https://checkout.lodgify.com/api/v1/checkout/price?propertyId=${listingId}&arrival=${checkInDateLocalized}&departure=${checkOutDateLocalized}&guests=${guestsCount}&currency=${currency}`
                );

                const data = await response.json();

                if (response.status === 400) {
                    throw new Error(`Error ${response.status}: ${data.title || response.statusText}`);
                }


                const QUOTE = new LODGIFY_QUOTE_TO_CLIENT_LISTING_QUOTE(data);
                const CONVERTED_QUOTE = QUOTE.convert();
                return CONVERTED_QUOTE;
            } catch (error) {
                console.error("Error fetching quote data:", error);
                return { error: error.message, status: error.status || "Failed to fetch quote data" };
            }
        };

        // Await the result from QuoteData and return it
        return await QuoteData();
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
        const { search } = params || {};
        const { checkInDateLocalized, checkOutDateLocalized } = search || {};

        return fetchLodgifyData(
            `https://api.lodgify.com/v1/availability?periodStart=${checkInDateLocalized}&periodEnd=${checkOutDateLocalized}`,
            keys,
            "fetchLodgifyListingsDates"
        );
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
            const pagination = listings.pagination
            const coverted_listings = listings.results.map((listing: guesty_listings) => new GuestyConverter(listing).convert());

            return { coverted_listings, cities, pagination };
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
            const [listingDetails, reviews, availabilitie] = await Promise.all([
                routes.fetchGuestyListingDetails(listingId, token),
                routes.fetchGuestyListingReviews(listingId, token),
                routes.fetchGuestyListingAvailabilities(token, params)
            ]);

            // Convert listing to Client Requirement
            const listing = new client_listing_detail_Converter(listingDetails);
            const singleListing = listing.convert();
            const availabilities = availabilitie.filter((date) => date.status !== "available")
            return { singleListing, reviews, availabilities };
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
    getGuesty_PaymentPage: async (
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
            const [listingDetails, paymentProvider] = await Promise.all([
                routes.fetchGuestyListingDetails(listingId, token),
                routes.fetchGuestyPaymentProviderID(token, params)
            ]);

            // Convert listing to Client Requirement
            const listing = new client_listing_detail_Converter(listingDetails);
            const singleListing = listing.convert();
            return { singleListing, paymentProvider };
        } catch (error) {
            console.error(
                "Error fetching PaymentPage:",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },

    //////////////LODGIFY///////////////////////////////////////////

    getLodgify_Listings: async (internal_ID: string, params: ParamsLodgifySite, auth?: keysType) => {
        /**
  * NOTE: This function conditionally fetches API keys either from the `auth` parameter 
  * (if provided) or by calling `getLodgifyKeys` using `internal_ID`.
  * 
  * Why is this important?
  * - To ensure flexibility in key handling: external callers can pass custom keys via `auth`,
  *   avoiding redundant API calls.
  * - To optimize performance: `getLodgifyKeys` is only called when `auth` is not provided, 
  *   reducing unnecessary network requests.
  * - To ensure robust error handling: The function validates the presence of required keys 
  *   and throws meaningful errors when they're missing.
  */
        let apiKey: string;
        let appKey: string;

        if (auth) {
            // If `auth` is provided, extract keys directly from it
            apiKey = auth.apiKey;
            appKey = auth.appKey;
        } else {
            // If `auth` is not provided, fetch keys from Lodgify using `internal_ID`
            const keys = await getLodgifyKeys(internal_ID);

            // Extract `ApiKey` and `AppKey` from the fetched keys
            apiKey = keys.client.ApiKey;
            appKey = keys.client.AppKey;
        }

        // Validate that both `apiKey` and `appKey` are available
        // If either is missing, throw an error
        if (!apiKey || !appKey) {
            throw new Error("Missing Lodgify API keys");
        }

        // Create the keys object
        const keysObject: keysType = { apiKey, appKey };

        try {
            // Conditionally include fetchLodgifyListingsBETA
            const promises = [routesLodgify.fetchLodgifyListings(keysObject)];
            if (params.id) {
                const data = await routesLodgify.fetchLodgifyListingsBETA(params)
                // console.log(data.data.items)
                promises.push(routesLodgify.fetchLodgifyListingsBETA(params));
            }

            const [listings, additionalData] = await Promise.all(promises);

            // Convert listings
            const coverted_listings = listings.items
                .filter((lst) => lst.is_active)
                .map((listing: lodgify_listings) => new ListingConverter(listing).convert());

            const cities = {
                results: coverted_listings
                    .map((i) => ({
                        city: i.address.city,
                        state: i.address.state,
                        country: i.address.country,
                    }))
                    .filter((value, index, self) =>
                        index === self.findIndex((t) => t.city === value.city && t.state === value.state)
                    ),
            };

            const listingExtraData = params.id !== "" ? additionalData?.data.items : null;

            // console.log(cities);
            // console.log(listingExtraData);

            return { coverted_listings, cities, listingExtraData };
        } catch (error) {
            console.error("Error fetching listings or cities:", error.message);
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },

    getLodgify_Listings_search: async (internal_ID: string, params: ParamsDatesSearchType) => {
        // @fileoverview Lodgify API Listing Filters Implementation

        // Implements filtering capabilities for vacation rental listings using the Lodgify API.
        //Filters can be applied independently or combined: location, dates, and guest count.
        // Note: Lodgify API doesn't support direct query filtering - all filtering is done post-fetch.

        // Example Usage:

        // All listings
        // const allListings = await getListings({});

        // Location only
        // const cityListings = await getListings({ location:{city: "New York”} });

        // Combined filters
        // const filteredListings = await getListings({
        //   location:{city: "New York"},
        //   guestsCount: 5,
        //   dateRange: {
        //     checkInDateLocalized: new Date("2024-01-03"),
        //     checkOutDateLocalized: new Date("2024-01-19")
        //   }
        // });



        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;

        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        }
        const keysObject: keysType = { appKey: AppKey, apiKey: ApiKey };



        const { search,lodgifySite } = params;
        const validDates = !!search.checkInDateLocalized && !!search.checkOutDateLocalized;

        // 

        try {

            const getSearchResults = async (auth): Promise<ListingsReturnType> => {
                // Parallelize data fetching where possible
                const [allListings, availabilities] = await Promise.all([
                    actions.getLodgify_Listings(internal_ID, { id: lodgifySite?.id, url: lodgifySite?.url}, auth),
                    validDates
                        ? routesLodgify.fetchLodgifyListingsDates(auth, params)
                        : Promise.resolve([]) // No availabilities needed if dates are invalid
                ]);

                // Build a Map for quick lookup of `listingExtraData`
                const extraDataMap = new Map(
                    allListings.listingExtraData.map((info: any) => [info.property_id.toString(), info])
                );

                // Append additional info to listings using the Map
                const appendedListings = allListings.coverted_listings.map((listing: any) => ({
                    ...listing,
                    moreinfo: extraDataMap.get(listing.id) || null
                }));

                // Initialize listings object
                const listings = {
                    count: appendedListings.length,
                    items: appendedListings
                };

                // Early exits for invalid or empty listings
                if (!listings.items?.length) {
                    return {
                        total: 0,
                        items: [],
                        error: listings.items ? 'No listings found' : 'Invalid listings format: missing items array'
                    };
                }

                // Initialize filters
                let filteredListings = listings.items;
                const appliedFilters: string[] = [];

                // Location Filter
                if (search.location?.city) {
                    const city = search.location.city;

                    filteredListings = filteredListings.filter(
                        (listing: any) =>
                            listing.address.city === city || listing.moreinfo?.city_name === city
                    );
                    appliedFilters.push(`location: ${city}`);
                }

                // Date Filter
                if (validDates) {
                    const { checkInDateLocalized, checkOutDateLocalized } = params?.search || {};
                    const checkInDate = new Date(checkInDateLocalized);
                    const checkOutDate = new Date(checkOutDateLocalized);

                    if (checkInDate < checkOutDate) {
                        const START = dayjs(checkInDateLocalized).format('YYYY-MM-DD');
                        const END = dayjs(checkOutDateLocalized).format('YYYY-MM-DD');

                        // Create a Set of available property IDs
                        const availableIds = new Set(
                            availabilities
                                .filter(
                                    listing =>
                                        listing.is_available &&
                                        listing.period_start === START &&
                                        listing.period_end === END
                                )
                                .map(listing => listing.property_id)
                        );
                        
                        // Filter listings by availability
                        filteredListings = filteredListings.filter(
                            (listing: any) =>
                                availableIds.has(Number(listing.id)) || availableIds.has(Number(listing.moreinfo?.id))
                        );
                        
                        appliedFilters.push(`date range: ${START} to ${END}`);
                        
                        // If no listings are available for the selected date range, return an error
                        if (filteredListings.length === 0) {
                            return {
                                total: 0,
                                items: [],
                                error: `No listings available for the selected date range: ${START} to ${END}.`
                            };
                        }
                    } else {
                        return {
                            total: 0,
                            items: [],
                            error: 'Invalid date range: Check-in date must be earlier than check-out date.'
                        };
                    }
                }
                
                // Guest Count Filter
                if (search.guestsCount && search.guestsCount > 0) {
                    const requestedGuests = search.guestsCount;
                    
                    filteredListings = filteredListings.filter(
                        (listing: any) => listing.moreinfo?.max_people >= requestedGuests
                    );
                    
                    appliedFilters.push(`guest count: ${requestedGuests}`);
                }

                // Final Check: Return results or error if no listings match
                if (filteredListings.length === 0) {
                    return {
                        total: 0,
                        items: [],
                        error: 'No results found for the applied filters'
                    };
                }

                // Construct the dynamic message
                const message = `Listings returned based on combined search criteria (${appliedFilters.join(', ')})`;
                
                return {
                    total: filteredListings.length,
                    items: filteredListings,
                    message
                };
            };
            const searchResult = await getSearchResults(keysObject)
            //console.log("allListings", searchResult)


            return { filteredListings: searchResult };
        } catch (error) {
            console.error("Error fetching Listings_search:", error.message);
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
            const [listingDetails, listingDetailsBETA, availabilities] = await Promise.all([
                routesLodgify.fetchLodgifyListingDetails(keysObject, params),
                routesLodgify.fetchLodgifyListingDetailsBETA(keysObject, params),
                routesLodgify.fetchLodgifyListingAvailabilities(keysObject, params),
            ]);

            const roomId = listingDetails?.rooms?.[0]?.id;
            const roomInfo = await routesLodgify.fetchLodgifyListingInfo(keysObject, params, roomId);

            // Convert listing to FRONT END Requirement

            //PROPERTY DETAILS API CALL 
            const listing = new LODGIFY_DETAILS_TO_LISTING_DETAILS_FORMAT(listingDetails as lodgify_listings_details);
            const singleListingObject = listing.convert();

            //ROOM INFO API CALL
            const listingRoomInfo = new LODGIFY_ROOM_INFO_TO_LISTING_DETAILS_FORMAT(roomInfo as Room_info_in_a_property_by_id);
            const listing_roomInfo = listingRoomInfo.convert()


            //PROPERTY DETAILS BETA (TEMP) API CALL ** gets addional data missing from other apis 
            const DetailsBETA = new LODGIFY_DETAILS_BETA_TO_LISTING_DETAILS_FORMAT(listingDetailsBETA as Lodgify_Listing_Details_BETA);
            const listing_details_beta = DetailsBETA.convert()
            //console.log(listing_details_beta)

            const singleListing = {
                ...singleListingObject, ...listing_roomInfo, ...listing_details_beta, publicDescription: {
                    ...listing_roomInfo.publicDescription, // Spread the existing fields from singleListing
                    ...listing_details_beta.publicDescription, // Spread the fields from availabilities
                },
            }
            // console.log(listing_roomInfo)
            return { singleListing, availabilities };

        } catch (error) {
            console.error("Error fetching listing details :", error.message);
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
        if (req.headers['x-vercel-warmup']) {
            return res.status(200).json({ message: 'Warm-up request ignored' });
        }

        // Increment the request count (PROD ONLY)
         await incrementRequestCount(internal_ID);


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
            if (actionResults.code === "LISTING_IS_NOT_AVAILABLE") {
                return res.status(200).json(actionResults);
            }
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
