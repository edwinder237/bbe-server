import { handleFetch } from "../utils/handleFetching";
import getAuth from "../utils/getAuth";
import dayjs from "dayjs";

import {
    integrationTypes,
    actionsParams,
    FetchResponse,
    Params,
    FetchingHelperParams,
    handleFetchParams,


    //CLIENT FORMAT
    CLIENT_LISTINGS_RETURN,
    CLIENT_LISTING_DETAILS_RETURN,
    CLIENT_LISTING_REVIEWS_RETURN,
    CLIENT_LISTING_CALENDAR_RETURN,
    CLIENT_LISTING_QUOTE_RETURN,
    CLIENT_LISTINGS_OBJECT,
    CLIENT_LISTING_PAYMENT_RETURN,
    CLIENT_LISTING_RESERVATION_RETURN,
    CLIENT_LISTINGS_LOCATIONS_RETURN,
} from "../utils/types";

import {
    guestyListingCalendarReturnType,
    guestyListingDetailsReturnType,
    guestyListingReviewsReturnType,
    guestyListingsLocationReturnType,
    guestyListingsObjectType,
    guestyListingsReturnType,

} from "../utils/types/guesty";

import {
    guesty_listings_converter,
    guesty_listing_detail_Converter,
    guesty_listing_quote_Converter,
    guesty_listing_reviews_converter,
    guesty_listing_calendar_converter
} from "../utils/clientConverter";
import { error } from "console";


interface guestyApiFetcherParams {
    token: string;
    listingId?: string;
    params?: Params;
};

interface guestyApiProp {
    endpointUrl: string;
    token: string;
    action: string;
    method: "GET" | "POST";
    body?: string;
}
interface LocationType {
    city?: string;
    state?: string;
    country?: string;
}

interface SearchParamsType {
    guestsCount?: number;
    checkInDateLocalized?: string;
    checkOutDateLocalized?: string;
    location?: LocationType;
}

interface BuildGuestyUrlArgs {
    search?: SearchParamsType;
}
interface guestyApiReturn {
    results?: any;
    pagination?: {
        total: number
        cursor: {
            next: string;
        }
    }
    error: {
        code: string;
        message: string;
        data: { moreDetails: any, requestId: string; }
    }
}

// Helper function to fetch data with timeout
const fetchGuestyData = async ({ endpointUrl, token, action, method, body }: guestyApiProp): Promise<any> => {
    const defaultOptions: RequestInit = {
        method: method,
        headers: {
            accept: "application/json; charset=utf-8",
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
        }

    };

    function getOptionsRequest(action: string) {
        switch (action) {
            case "fetchListingReservation":
                return { ...defaultOptions, body };
            case "fetchListingQuote":
                return { ...defaultOptions, body };

            default:
                // Fallback: if the action isn't recognized, just return defaultOptions
                return defaultOptions;
        }
    }

    const options = getOptionsRequest(action);


    try {
        const response = await handleFetch({ fetchUrl: endpointUrl, options, action }) as guestyApiReturn;

        //SAME DAY BOOKING HANDLING ERROR HANDLING
        if (response?.error?.message === 'Query string parameter "checkIn" is invalid') {
            throw new Error('SAMEDAY_BOOKING_ERROR');     
        }
        if (response.error) {
            console.log(response.error)
            throw new Error(`${response?.error.code} `);
        }

        return response;

    } catch (error) {
        console.error(`Error in GUESTY FETCHER: ${error}`);
        throw error;
    }
};

export const guestyFetchers = {
    fetchListings: async ({ token, params }: guestyApiFetcherParams): Promise<guestyListingsReturnType> => {

        const endpointUrl = "https://booking.guesty.com/api/listings?numberOfBedrooms=0&numberOfBathrooms=0&limit=100";
        const action = "fetchGuestyListings";
        const method = "GET";
        const response = await fetchGuestyData({ endpointUrl, token, action, method });
        return response;
    },
    fetchListingsV2: async ({ token, params }: guestyApiFetcherParams): Promise<guestyListingsReturnType> => {

        const endpointUrl = getURLforListingSearch(params);
        const action = "fetchListingSearch";
        const response = await fetchGuestyData({ endpointUrl, token, action, method: "GET" });
        console.log("search", response)
        return response;
    },
    fetchGuestyNextPage: async ({ token, params }) => {
        //Not used for now
        const { next } = params.nextPageUrl;
        const endpointUrl = `https://booking.guesty.com/api/listings?cursor=${next}&limit=9`;
        const action = "fetchGuestyNextPage";
        const response = await fetchGuestyData({ endpointUrl, token, action, method: "GET" });

        return response;
    },
    fetchListingSearch: async ({ token, params }: guestyApiFetcherParams): Promise<guestyListingsReturnType> => {

        const endpointUrl = getURLforListingSearch(params);
        const action = "fetchListingSearch";
        const response = await fetchGuestyData({ endpointUrl, token, action, method: "GET" });
        return response;
    },
    fetchLocation: async ({ token }: guestyApiFetcherParams): Promise<guestyListingsLocationReturnType> => {
        const endpointUrl = "https://booking.guesty.com/api/listings/cities";
        const action = "fetchGuestyCities";
        const method = "GET";
        const response = await fetchGuestyData({ endpointUrl, token, action, method });
        return response;
    },
    fetchListingDetails: async ({ listingId, token }: guestyApiFetcherParams): Promise<guestyListingDetailsReturnType> => {
        if (listingId === undefined) {
            throw new Error("Listing ID is undefined");
        }
        const endpointUrl = `https://booking.guesty.com/api/listings/${listingId}`;
        const action = "fetchGuestyListingDetails";
        const method = "GET";
        const response = await fetchGuestyData({ endpointUrl, token, action, method });
        return response;
    },
    fetchListingReviews: async ({ token, listingId }: guestyApiFetcherParams): Promise<guestyListingReviewsReturnType> => {
        const endpointUrl = `https://booking.guesty.com/api/reviews?listingId=${listingId}`;
        const action = "fetchGuestyListingReviews";
        const method = "GET";
        const response = await fetchGuestyData({ endpointUrl, token, action, method });
        return response;
    },
    fetchListingCalendar: async ({ token, params }): Promise<guestyListingCalendarReturnType> => {
        const { listingId, availabilities } = params;
        const { fromDate, toDate } = availabilities;
        const action = "fetchGuestyListingAvailabilities";
        const method = "GET";
        const endpointUrl = `https://booking.guesty.com/api/listings/${listingId}/calendar?from=${fromDate}&to=${toDate}`;
        const response = await fetchGuestyData({ endpointUrl, token, action, method });
        return response;

    },
    fetchPaymentProviderID: async ({ token, params }) => {

        const endpointUrl = `https://booking.guesty.com/api/listings/${params.listingId}/payment-provider`;
        const action = "fetchGuestyPaymentProviderID";
        const method = "GET";
        const response = await fetchGuestyData({
            endpointUrl,
            token,
            action,
            method,
        });
        return response;
    },
    fetchListingReservation: async ({ token, params }) => {
        //Not used for now
        const { quoteId, ratePlanID, ccToken, guest, policy } = params.reservation;
        const endpointUrl = `https://booking.guesty.com/api/reservations/quotes/${quoteId}/instant`;
        const action = "fetchListingReservation";
        const method = "POST";
        const body: string = JSON.stringify({
            guest: {
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
                phone: guest?.phone,
            },
            ccToken: ccToken,
            ratePlanId: ratePlanID,
            policy: {
                privacy: {
                    isAccepted: policy.privacy.isAccepted,
                    version: policy.privacy.version,
                    dateOfAcceptance: policy.privacy.dateOfAcceptance,
                },
                termsAndConditions: {
                    isAccepted: policy.termsAndConditions.isAccepted,
                },
                marketing: { isAccepted: policy.marketing.isAccepted },
            },
        });
        const response = await fetchGuestyData({
            endpointUrl,
            token,
            action,
            method,
            body,
        });

        return response;
    },
    fetchListingQuote: async ({ token, params }) => {
        const endpointUrl = "https://booking.guesty.com/api/reservations/quotes";
        const action = "fetchListingQuote";
        const method = "POST";
        const body: string = JSON.stringify({
            guestsCount: params.quote.guestsCount,
            checkInDateLocalized: params.quote.checkInDateLocalized,
            checkOutDateLocalized: params.quote.checkOutDateLocalized,
            listingId: params.listingId,
            ...(params.quote?.coupons ? { coupons: params.quote.coupons } : {}), // Only include if coupons exists
        });
        const response = await fetchGuestyData({
            endpointUrl,
            token,
            action,
            method,
            body,
        });
        //handle unavailable listing request

        if (response === "LISTING_IS_NOT_AVAILABLE") {
            return {
                code: "LISTING_IS_NOT_AVAILABLE",
                status: 400,
                message:
                    "The selected dates are unavailable. Please choose different dates.",
            };
        }
        //handle bad coupon request
        if (response === "INVALID_COUPON") {
            return {
                code: "INVALID_COUPON",
                status: 400,
                message: "Valid coupons does not match requested coupons",
            };
        }
        return response;
    },

};

export const guestyActions = {
    getlistings: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {

        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType: "guesty",
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }

            const token = tokenResponse.token;
            if (!token) {
                throw new Error("Token is undefined");
            }
            // console.log("debug",params)
            try {
                const [listings] = await Promise.all([
                    guestyFetchers.fetchListings({ token, params })
                ]);

                const pagination = listings.pagination;
                const converted_listings = listings.results.map(
                    (listing: guestyListingsObjectType) =>
                        new guesty_listings_converter(listing).convert()
                );

                // --- custom pagination via offset + limit ---
                const limit = params.limit ?? converted_listings.length;
                const offset = params.offset ?? 0;
                const paginated_listings = converted_listings.slice(offset, offset + limit);

                return {
                    items: paginated_listings,
                    pagination,
                    total: converted_listings.length,
                };
            } catch (error) {
                console.error("Error fetching listings or cities:", error.message);
                throw new Error(`Fetching failed: ${error.message}`);
            }
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in GUESTY ACTION - getListings:", error.message);
            throw error;
        }
    },
    getlistingsV2: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {

        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType: "guesty",
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }

            const token = tokenResponse.token;
            if (!token) {
                throw new Error("Token is undefined");
            }
            // console.log("debug",params)
            try {
                const [listings] = await Promise.all([
                    guestyFetchers.fetchListingsV2({ token, params })
                ]);

                const pagination = listings.pagination;
                const converted_listings = listings.results.map(
                    (listing: guestyListingsObjectType) =>
                        new guesty_listings_converter(listing).convert()
                );

                // --- custom pagination via offset + limit ---
                const limit = params.limit ?? converted_listings.length;
                const offset = params.offset ?? 0;
                const paginated_listings = converted_listings.slice(offset, offset + limit);

                return {
                    items: paginated_listings,
                    pagination,
                    total: converted_listings.length,
                };
            } catch (error) {
                console.error("Error fetching listings or cities:", error.message);
                throw new Error(`Fetching failed: ${error.message}`);
            }
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in GUESTY ACTION - getListings:", error.message);
            throw error;
        }
    },
    getlistingsNextPage: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {

        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType: "guesty",
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }

            const token = tokenResponse.token;
            if (!token) {
                throw new Error("Token is undefined");
            }

            try {
                const [listings] = await Promise.all([
                    guestyFetchers.fetchGuestyNextPage({ token, params })
                ]);
                const pagination = listings.pagination;
                const converted_listings = listings.results.map(
                    (listing: guestyListingsObjectType) =>
                        new guesty_listings_converter(listing).convert()
                );
                return {
                    items: converted_listings,
                    pagination,
                    total: converted_listings.length,
                };
            } catch (error) {
                console.error("Error fetching listings or cities:", error.message);
                throw new Error(`Fetching failed: ${error.message}`);
            }
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in GUESTY ACTION - getListings:", error.message);
            throw error;
        }
    },
    getListingDetails: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_DETAILS_RETURN> => {
        const { listingId } = params;
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "guesty" });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;

            // Fetch listing details and reviews
            const [listingDetails, reviews, availabilitie] = await Promise.all([
                guestyFetchers.fetchListingDetails({ listingId, token }),
                guestyFetchers.fetchListingReviews({ listingId, token }),
                guestyFetchers.fetchListingCalendar({ token, params }),
            ]);

            // Convert listing to Client Requirement
            const converted_listing = new guesty_listing_detail_Converter(listingDetails).convert();

            const availabilities = availabilitie.filter((date) => date.status !== "available");

            const converted_reviews = new guesty_listing_reviews_converter(reviews).convert();


            //SPREAD ADDITIONAL DATA TO ITEM 

            const converted_availabilities = new guesty_listing_calendar_converter(availabilities).convert();


            const spread_converted_listing = { ...converted_listing, calendar: converted_availabilities, reviews: converted_reviews };

            return { item: spread_converted_listing };

        } catch (error: any) {
            console.error("Error in getListingDetails:", error.message);
            throw error;
        }
    },
    getListingCalendar: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_CALENDAR_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "guesty" });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const response = await guestyFetchers.fetchListingCalendar({
                token,
                params,
            });
            const converted_availabilities = new guesty_listing_calendar_converter(response).convert().items;
            return { items: converted_availabilities };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingCalendar:", error.message);
            throw error;
        }
    },
    getListingReservation: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_RESERVATION_RETURN> => {
        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType: "guesty",
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const response = await guestyFetchers.fetchListingReservation({
                token,
                params,
            });

            return response;
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingCalendar:", error.message);
            throw error;
        }
    },
    getListingQuote: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_QUOTE_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "guesty" });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const response = await guestyFetchers.fetchListingQuote({ token, params });
            const converted_quote = new guesty_listing_quote_Converter(response).convert();
            return { item: converted_quote };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingQuote:", error.message);
            throw error;
        }
    },
    getListingSearch: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "guesty" });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;

            const response = await guestyFetchers.fetchListingSearch({
                token,
                params,
            });


            const converted_listings = response.results.map(
                (listing: guestyListingsObjectType) =>
                    new guesty_listings_converter(listing).convert()
            );
            // --- custom pagination via offset + limit ---
            const limit = params.limit ?? converted_listings.length;
            const offset = params.offset ?? 0;
            const paginated_listings = converted_listings.slice(offset, offset + limit);

            const results: CLIENT_LISTINGS_RETURN = {
                total: converted_listings.length,
                items: paginated_listings,
            };

            return { items: results.items, total: results.total };

        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingSearch:", error.message);
            throw error;
        }
    },
    getListingPayment: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_PAYMENT_RETURN> => {
        const { listingId } = params;
        if (listingId === undefined) {
            throw new Error("Listing ID is undefined");
        }
        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType: "guesty",
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const [
                listingDetails,
                paymentProvider
            ] = await Promise.all([
                guestyFetchers.fetchListingDetails({ token, params, listingId }),
                guestyFetchers.fetchPaymentProviderID({ token, params })
            ]);
            const listing = new guesty_listing_detail_Converter(listingDetails);
            const singleListing = listing.convert();
            const spread_converted_listing = { ...singleListing, paymentProvider: paymentProvider };
            return { item: spread_converted_listing };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingPayment:", error.message);
            throw error;
        }

    },
    getListingLocations: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_LOCATIONS_RETURN> => {
        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType: "guesty",
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const response = await guestyFetchers.fetchLocation({
                token,
                params,
            });

            return { items: response.results, total: response.count };

        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in GUESTY ACTION - getLocations:", error.message);
            throw error;
        }
    },

};

// URL-building logic in a function
function getURLforListingSearch({ search }: BuildGuestyUrlArgs): string {
    const { location = { city: "", state: "", country: "" } } = search;
    const { guestsCount, checkInDateLocalized, checkOutDateLocalized } = search;

    // Only format dates if they exist
    const checkIn = checkInDateLocalized ? dayjs(checkInDateLocalized).format("YYYY-MM-DD") : null;
    const checkOut = checkOutDateLocalized ? dayjs(checkOutDateLocalized).format("YYYY-MM-DD") : null;

    const city = location.city;
    const state = location.state;
    const country = location.country;

    const baseUrl = "https://booking.guesty.com/api/listings";
    const urlParams: string[] = [];

    // Required parameters
    urlParams.push(`minOccupancy=${guestsCount || 1}`); // Default to 1 guest if not provided
    urlParams.push(`numberOfBedrooms=0`);
    urlParams.push(`numberOfBathrooms=0`);

    // Optional parameters
    if (city) urlParams.push(`city=${encodeURIComponent(city)}`);
    if (country) urlParams.push(`country=${encodeURIComponent(country)}`);
    if (state) urlParams.push(`state=${encodeURIComponent(state)}`);

    // Date parameters + limit
    if (checkIn) {
        urlParams.push(`checkIn=${encodeURIComponent(checkIn)}`);
    }
    if (checkOut) {
        urlParams.push(`checkOut=${encodeURIComponent(checkOut)}`);
    }
    urlParams.push(`limit=100`);

    // Construct and return the full URL
    return `${baseUrl}?${urlParams.join("&")}`;
}
