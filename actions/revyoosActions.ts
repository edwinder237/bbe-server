import { handleFetch } from "../utils/handleFetching";
import { kv } from "@vercel/kv";
import { getLodgifyKeys } from "../utils/tokenServiceCaching";
import { wixCmsFetchers } from "./wixCmsActions";
import {
    integrationTypes,
    actionsParams,
    Params,
    FetchResponse,
    FetchingHelperParams,
    handleFetchParams,
    //CLIENT FORMAT
    CLIENT_LISTINGS_RETURN,
    CLIENT_LISTING_DETAILS_RETURN,
    CLIENT_LISTING_REVIEWS_RETURN,
    CLIENT_LISTING_CALENDAR_RETURN,
    CLIENT_LISTING_QUOTE_RETURN,
    FetchMap,
    ApiFetcherParams,
    lodgifyAuthParams,
    CLIENT_LISTINGS_OBJECT,
    CLIENT_LISTINGS_LOCATIONS_RETURN,
    GlobalFetcherReturnType
} from "../utils/types";

import {
    lodgifyListingsObjectTpye,
    lodgifyListingsReturnType,
    lodgifyListingDetailsObjectType,
    lodgifyListingDetailsReturnType,
    Lodgify_Listing_Details_SITE_ObjectType,
    lodgifyListingCalendarObectType,
    lodgifyListingCalendarReturnType,
    lodgifyListingRoomInfoObjectType,
    lodgifyListingRoomInfoReturnType,
    lodgifyListingQuoteReturnType,
    lodgifyListingQuoteObjectType
} from "../utils/types/lodgify";
import {
    lodgify_listings_converter,
    lodgify_listing_details_converter,
    lodgify_listing_roomInfo_converter,
    lodgify_listing_details_SITE_converter,
    lodgify_listing_quote_converter,
    lodgify_listing_api_quote_converter,
    lodgify_listing_calendar_converter,
    lodgify_listings_rateCalendar_converter,
    revyoos_listing_reviews_converter
} from "../utils/clientConverter";
import { method } from "lodash";

const integrationType: integrationTypes = "lodgify";

interface LodgifyApiReturnType {
    items: any;
    item: any;
    //ON ERRORS
    type: string;
    title: string; // message
    status: number;//400,
    detail: string;
    traceId: string;
}

interface LodgifyApiProp {
    endpointUrl: string;
    action: string;
    lodgifyAuth: lodgifyAuthParams;
    method: "GET" | "POST";
    body?: string;
    auth?: lodgifyAuthParams;
    default_Lang: string | "en";
}

interface LodgifySiteApiProp {
    endpointUrl: string;
    action: string;
    method: "GET" | "POST";
    lodgifySite: lodgifySite;
    body?: site_body;
}
interface site_body {
    people: number;
    grouped_facilities: string;
    sort: string;
    start?: string;
    end?: string;
}

interface lodgifySite {
    url: string;
    id: string;
}

const REVYOOS_TOKEN_KEY = "revyoos_token";
const REVYOOS_TOKEN_TTL = 6 * 24 * 60 * 60; // 6 days in seconds

const getRevyoosToken = async (): Promise<string> => {
    try {
        const cachedToken = await kv.get(REVYOOS_TOKEN_KEY);
        if (cachedToken) {
            return cachedToken as string;
        }
    } catch (error) {
        console.warn("Error reading revyoos token from Redis, fetching new one:", error.message);
    }

    return fetchNewRevyoosToken();
};

const fetchNewRevyoosToken = async (): Promise<string> => {
    const signinUrl = "https://www.revyoos.com/lapi/signin?email=roz.bourgeois@gmail.com&password=97c300a2806fa932abc197b878824d1346d287c4";
    console.log("[Revyoos] Attempting to fetch new token from signin endpoint...");
    try {
        const response = await handleFetch({
            fetchUrl: signinUrl,
            options: { method: "GET", headers: { accept: "application/json" } },
            action: "revyoosSignin",
        }) as any;

        console.log("[Revyoos] Signin response received:", JSON.stringify(response));

        const token = response.s_token;
        if (!token) {
            console.error("[Revyoos] No token field in signin response. Full response:", JSON.stringify(response));
            throw new Error("No token returned from Revyoos signin");
        }

        console.log("[Revyoos] Token fetched successfully, caching in Redis with TTL:", REVYOOS_TOKEN_TTL);
        // Cache in Redis with TTL (non-blocking — don't let Redis failure prevent returning the token)
        try {
            await kv.set(REVYOOS_TOKEN_KEY, token, { ex: REVYOOS_TOKEN_TTL });
            console.log("[Revyoos] Token cached in Redis successfully");
        } catch (cacheError) {
            console.warn("[Revyoos] Failed to cache token in Redis, continuing without cache:", cacheError.message);
        }
        return token;
    } catch (error) {
        console.error("[Revyoos] Error fetching new token:", error.message);
        throw error;
    }
};

// Helper function to fetch Lodgify data with timeout

const fetchRevyoosData = async ({ endpointUrl, auth, action, method }): Promise<any> => {
    const options: RequestInit = {
        method: method,
        headers: {
            accept: "application/json",
        },
    };
    try {        const response = await handleFetch({ fetchUrl: endpointUrl, options, action }) as any;
        if (response.status === 400) {
            console.warn(`Error: ${response.title || response.detail}`)
            throw new Error(`${response.title || response.detail}`)
        }
        return response
    } catch (error) {
        console.error(`Error REVYOOS FETCHER: ${error.message}`);
        throw error;
    }

};

const fetchLodgifyData = async ({ endpointUrl, lodgifyAuth, action, method, default_Lang }: LodgifyApiProp): Promise<LodgifyApiReturnType> => {
    const appKey = lodgifyAuth?.appKey;
    const apiKey = lodgifyAuth?.apiKey;

    const options: RequestInit = {
        method: method,
        headers: {
            accept: "application/json",
            "X-ApiKey": apiKey || "", // Ensure these are strings
            "x-appkey": appKey || "", // Ensure these are strings
            "Accept-Language": default_Lang || "en"
        },
    };
    try {
        const response = await handleFetch({ fetchUrl: endpointUrl, options, action }) as LodgifyApiReturnType;
        if (response.status === 400) {
            console.warn(`Error: ${response.title || response.detail}`)
            throw new Error(`${response.title || response.detail}`)
        }
        return response

    } catch (error) {
        console.error(`Error LODGIFY FETCHER: ${error.message}`);
        throw error;
    }
};

const fetchLodgifySiteData = async ({ endpointUrl, method, lodgifySite, action, body }: LodgifySiteApiProp): Promise<any> => {
    const { url } = lodgifySite;
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "En", // Adjust as needed
        Origin: url, // Adjust as needed
        Referer: url, // Adjust as needed
        "Sec-CH-UA":
            '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"macOS"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        Priority: "u=1, i",
    };

    const options = {
        method: method,
        headers,
        body: JSON.stringify(body),
    };

    try {
        const response = await handleFetch({ fetchUrl: endpointUrl, options, action, }) as FetchResponse;

        if (!response.success) {
            throw new Error(
                `Failed to fetch data from ${action}: ${response.message}`
            );
        }
        return response.data;
    } catch (error) {
        console.error(`Error FETCHER - in fetchLodgifySiteAPI: ${error.message}`);
        throw error;
    }
};

const lodgifySiteFetchers = {
    fetchSiteListings: async ({ params }: ApiFetcherParams): Promise<any> => {
        const { search } = params;
        const { id } = params.lodgifySite;
        const site = params.lodgifySite;

        // Determine if dates are invalid
        const isInvalidDate =
            !search?.checkInDateLocalized ||
            !search?.checkOutDateLocalized ||
            search.checkInDateLocalized === "Invalid Date" ||
            search.checkOutDateLocalized === "Invalid Date";

        const endpointUrl = `https://api.lodgify.com/v2/search/${id}`;
        const action = "fetchLodgify_SITE_listings";
        const method = "POST";

        const body = isInvalidDate
            ? { people: 1, grouped_facilities: "", sort: "price" }
            : {
                people: search.guestsCount,
                start: search.checkInDateLocalized,
                end: search.checkOutDateLocalized,
                grouped_facilities: "",
                sort: "price",
            };

        const response = await fetchLodgifySiteData({
            endpointUrl,
            lodgifySite: site,
            action,
            method,
            body,
        });
        return response;
    },
    fetchSiteListingDetails: async ({ auth, params }: ApiFetcherParams) => {
        const { default_Lang } = params;
        const endpointUrl = `https://checkout.lodgify.com/api/v1/checkout/property/${parseInt(
            params.listingId
        )}`;
        const action = "fetchLodgify_SITE_listingDetails";
        const method = "GET";
        const response = await fetchLodgifyData({ endpointUrl, action, method, lodgifyAuth: auth, default_Lang });
        return response;
    },
};

export const lodgifyFetchers: FetchMap = {


    fetchListings: async ({ auth: lodgifyAuth, params: { pageNum } }: ApiFetcherParams): Promise<lodgifyListingsReturnType> => {
        const endpointUrl = `https://api.lodgify.com/v2/properties?includeCount=true&includeInOut=true&page=${pageNum}&size=12`;
        const response = await fetchLodgifyData({
            endpointUrl,
            lodgifyAuth,
            action: "fetchLodgifyListings",
            method: "GET",
            default_Lang: "en",
        });

        return response;

    },
    fetchAllListings: async ({ auth: lodgifyAuth, params: { pageNum } }: ApiFetcherParams): Promise<lodgifyListingsReturnType> => {
        const endpointUrl = `https://api.lodgify.com/v2/properties?includeCount=true&includeInOut=true&page=${pageNum}&size=1000`;
        const response = await fetchLodgifyData({
            endpointUrl,
            lodgifyAuth,
            action: "fetchLodgifyListings",
            method: "GET",
            default_Lang: "en",
        });

        return response;

    },
    fetListingsSearch: async ({ auth, params }: ApiFetcherParams): Promise<lodgifyListingsReturnType> => {
        const { search, default_Lang } = params || {};
        const { checkInDateLocalized, checkOutDateLocalized } = search || {};
        const endpointUrl = `https://api.lodgify.com/v1/availability?periodStart=${checkInDateLocalized}&periodEnd=${checkOutDateLocalized}`;
        const lodgifyAuth = auth;
        const action = "fetchLodgifyListingsDates";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth, action, method: "GET", default_Lang: default_Lang });
        return response;
    },
    fetchListingDetails: async ({ auth, params }: ApiFetcherParams): Promise<lodgifyListingDetailsReturnType> => {
        const endpointUrl = `https://api.lodgify.com/v1/properties/${params.listingId}?includeInOut=false`;
        const lodgifyAuth = auth;
        const action = "fetchLodgifyListingDetails";
        const method = "GET";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth, action, method, default_Lang: "en" });
        return response;
    },

};

export const revyoosFetchers = {
    fetchingReyoosListingReviews : async ({ internal_ID, params, wix_params, auth, revyoosHoldingId }): Promise<any> => {
        const holdingId = revyoosHoldingId;
        let token = await getRevyoosToken();
        console.log(`Fetching Revyoos reviews for holding ID ${holdingId} with token ${token}`);
        const endpointUrl = `https://www.revyoos.com/lapi/reviews?token=${token}&page=1&limit=500&id_holding=${holdingId}`;

        try {
            const response = await fetchRevyoosData({
                endpointUrl,
                method: "GET",
                action: "fetchRevyoosListingReviews",
                auth: token
            });
            return response;
        } catch (error) {
            // Token may be expired — fetch a new one and retry once
            console.warn("Revyoos token may be expired, fetching new token and retrying...");
            token = await fetchNewRevyoosToken();
            const retryUrl = `https://www.revyoos.com/lapi/reviews?token=${token}&page=1&limit=500&id_holding=${holdingId}`;
            const response = await fetchRevyoosData({
                endpointUrl: retryUrl,
                method: "GET",
                action: "fetchRevyoosListingReviews_retry",
                auth: token
            });
            return response;
        }
    }};

export const revyoosActions = {
    getListings: async ({ internal_ID, params, wix_params, auth, }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {
        const isWixCMSRequested = wix_params?.wix_req;
        const isLodgifySiteRequested = !!params?.lodgifySite?.id;
        const { default_Lang } = params;

        /**
         * NOTE: This function conditionally fetches API keys either from the `auth` parameter
         * (if provided) or by calling `getLodgifyKeys` using `internal_ID`.
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
        if (!apiKey || !appKey) {
            throw new Error("Missing Lodgify API keys");
        }

        // Create the keys object
        const keysObject: lodgifyAuthParams = { apiKey, appKey };

        // 1) Always fetch Lodgify listings
        // 2) Conditionally fetch Lodgify BETA listings (or fallback with null)
        // 3) Conditionally fetch WixCMS details (or fallback with { item: {} })
        try {
            //Check if wixCms is requested
            const isWixCMSRequested = wix_params?.wix_req;

            //Check if lodgifyStie is requested
            const isLodgifySiteRequested = !!params?.lodgifySite?.id;

            // Always return all listings

            const promises = [
                lodgifyFetchers.fetchListings({ internal_ID, params, auth: keysObject, default_Lang }),
                isLodgifySiteRequested
                    ? lodgifySiteFetchers.fetchSiteListings({ auth: keysObject, params, default_Lang })
                    : Promise.resolve(null), // fallback if lodgify site is not requested
                isWixCMSRequested
                    ? wixCmsFetchers.fetchListings({ wix_params })
                    : Promise.resolve({ items: [] }), // Fallback if wixCms is not requested
            ];

            // Conditional Fetching return
            const [listings, lodfifySite, wixCmsData] = await Promise.all(
                promises
            );

            // ---------------------------------------------------------
            // 1) OPTIMIZED: Build a map for Wix CMS items to allow O(1) lookups
            // ---------------------------------------------------------
            let cmsMap = new Map();
            if (isWixCMSRequested) {
                for (const cmsItem of wixCmsData?.items || []) {
                    cmsMap.set(cmsItem.id, cmsItem);
                }
            }
            let lodgifySiteMap = new Map();
            if (isLodgifySiteRequested) {
                for (const site of lodfifySite?.items || []) {
                    lodgifySiteMap.set(site.property_id, site);
                }
            }

            // ---------------------------------------------------------
            // 3) Convert active Lodgify listings
            // ---------------------------------------------------------
            const converted_listings = listings.items
                .filter((lst: lodgifyListingsObjectTpye) => lst.is_active)
                .map((listing: lodgifyListingsObjectTpye) =>
                    new lodgify_listings_converter(listing).convert()
                );

            // ---------------------------------------------------------
            // 5) Decide if we attach Lodgify Site Data "listingExtraData"
            // ---------------------------------------------------------
            const lodgifySiteListingsData = isLodgifySiteRequested ? lodfifySite?.items : null;

            // ---------------------------------------------------------
            // 6) SPRED ADDITIONAL DATA TO ITEM OBJECT
            // ---------------------------------------------------------

            const spread_converted_listings = converted_listings.map((listing: CLIENT_LISTINGS_OBJECT): CLIENT_LISTINGS_OBJECT => {
                const foundWixCmsItem = cmsMap.get(parseInt(listing.id));
                const foundlodgifySite = lodgifySiteMap.get(parseInt(listing.id));
                return {
                    ...listing,
                    ...(foundlodgifySite && { lodgifySiteApi: foundlodgifySite }),
                    ...(foundWixCmsItem && { wixCmsApi: foundWixCmsItem })
                }

            });

            return {
                total: listings.count,
                items: spread_converted_listings,
            };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error ACTION - fetching lodgifyListings:", error.message);
            throw error;
        }
    },
    getAllListings: async ({ internal_ID, params, wix_params, auth, }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {
        const isWixCMSRequested = wix_params?.wix_req;
        const isLodgifySiteRequested = !!params?.lodgifySite?.id;
        const { default_Lang } = params;

        /**
         * NOTE: This function conditionally fetches API keys either from the `auth` parameter
         * (if provided) or by calling `getLodgifyKeys` using `internal_ID`.
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
        if (!apiKey || !appKey) {
            throw new Error("Missing Lodgify API keys");
        }

        // Create the keys object
        const keysObject: lodgifyAuthParams = { apiKey, appKey };

        // 1) Always fetch Lodgify listings
        // 2) Conditionally fetch Lodgify BETA listings (or fallback with null)
        // 3) Conditionally fetch WixCMS details (or fallback with { item: {} })
        try {
            //Check if wixCms is requested
            const isWixCMSRequested = wix_params?.wix_req;

            //Check if lodgifyStie is requested
            const isLodgifySiteRequested = !!params?.lodgifySite?.id;

            // Always return all listings

            const promises = [
                lodgifyFetchers.fetchAllListings({ internal_ID, params, auth: keysObject, default_Lang }),
                isLodgifySiteRequested
                    ? lodgifySiteFetchers.fetchSiteListings({ auth: keysObject, params, default_Lang })
                    : Promise.resolve(null), // fallback if lodgify site is not requested
                isWixCMSRequested
                    ? wixCmsFetchers.fetchListings({ wix_params })
                    : Promise.resolve({ items: [] }), // Fallback if wixCms is not requested
            ];

            // Conditional Fetching return
            const [listings, lodfifySite, wixCmsData] = await Promise.all(
                promises
            );

            // ---------------------------------------------------------
            // 1) OPTIMIZED: Build a map for Wix CMS items to allow O(1) lookups
            // ---------------------------------------------------------
            let cmsMap = new Map();
            if (isWixCMSRequested) {
                for (const cmsItem of wixCmsData?.items || []) {
                    cmsMap.set(cmsItem.id, cmsItem);
                }
            }
            let lodgifySiteMap = new Map();
            if (isLodgifySiteRequested) {
                for (const site of lodfifySite?.items || []) {
                    lodgifySiteMap.set(site.property_id, site);
                }
            }

            // ---------------------------------------------------------
            // 3) Convert active Lodgify listings
            // ---------------------------------------------------------
            const converted_listings = listings.items
                .filter((lst: lodgifyListingsObjectTpye) => lst.is_active)
                .map((listing: lodgifyListingsObjectTpye) =>
                    new lodgify_listings_converter(listing).convert()
                );

            // ---------------------------------------------------------
            // 5) Decide if we attach Lodgify Site Data "listingExtraData"
            // ---------------------------------------------------------
            const lodgifySiteListingsData = isLodgifySiteRequested ? lodfifySite?.items : null;

            // ---------------------------------------------------------
            // 6) SPRED ADDITIONAL DATA TO ITEM OBJECT
            // ---------------------------------------------------------

            const spread_converted_listings = converted_listings.map((listing: CLIENT_LISTINGS_OBJECT): CLIENT_LISTINGS_OBJECT => {
                const foundWixCmsItem = cmsMap.get(parseInt(listing.id));
                const foundlodgifySite = lodgifySiteMap.get(parseInt(listing.id));

                return {
                    ...listing,
                    ...(foundlodgifySite && { lodgifySiteApi: foundlodgifySite }),
                    ...(foundWixCmsItem && { wixCmsApi: foundWixCmsItem })
                }

            });

            return {
                total: listings.count,
                items: spread_converted_listings,
            };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error ACTION - fetching lodgifyListings:", error.message);
            throw error;
        }
    },
    getListingDetails: async ({ internal_ID, params, wix_params }: actionsParams): Promise<CLIENT_LISTING_DETAILS_RETURN> => {
        const { default_Lang } = params;
        const isWixCMSRequested = wix_params?.wix_req;
        const isLodgifySiteRequested = !!params?.lodgifySite?.id
        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;

        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        }
        const keysObject: lodgifyAuthParams = { appKey: AppKey, apiKey: ApiKey };

        try {
            // Fetch listing details and reviews
            const [listingDetails,
                //listingDetails_SITE, DISABLED
                calendar] = await Promise.all([
                    lodgifyFetchers.fetchListingDetails({ internal_ID, auth: keysObject, params, default_Lang }),
                    //  lodgifySiteFetchers.fetchSiteListingDetails({ auth: keysObject, params, default_Lang }), DISABLED
                    lodgifyFetchers.fetchListingCalendar({ auth: keysObject, params, default_Lang })
                ]);

            //Fetch roomInfo to access listing photos - ONLY SUPPORT ONE ROOM FOR NOW
            const RoomId = listingDetails?.rooms[0]?.id.toString();
            // SPREAD to params 
            params = { ...params, roomId: RoomId }
            const roomInfo = await lodgifyFetchers.fetchListingRoomInfo({ internal_ID, auth: keysObject, params, default_Lang });
            //FETCH additional data from WIX CMS

            const ListingDetails_WIX = isWixCMSRequested ? await wixCmsFetchers.fetchListingDetails({ internal_ID, wix_params }) : { item: {} };

            // CONVERSION TO FRONT END FORMAT

            //LISTING DETAILS 
            const converted_listing = await new lodgify_listing_details_converter(listingDetails as lodgifyListingDetailsObjectType).convert();

            //LISTING DETAILS (lodgify site api) ** gets addional data missing from other apis 
            // const converted_listing_SITE = new lodgify_listing_details_SITE_converter(listingDetails_SITE as unknown as Lodgify_Listing_Details_SITE_ObjectType).convert(); DISABLED
            //ROOM INFO 
            const converted_listingRoomInfo = new lodgify_listing_roomInfo_converter(roomInfo as lodgifyListingRoomInfoObjectType).convert();
            //CALENDAR 

            const converted_calendar = new lodgify_listing_calendar_converter(calendar as lodgifyListingCalendarObectType[]).convert();
            //const converted_calendar_MinDays = filterUnavailableDates(converted_calendar); // NO CLIENT with this feature for now

            // Filter out dates with min stay only for the specific internal_ID
            // this is used when client request a min bookable dates on their calendar
            // const unavailableDates = internal_ID !== "f9ae756d-be1b-4593-87aa-c245416e4ae7" ? (converted_calendar) :
            // (converted_calendar_MinDays);
            const unavailableDates = converted_calendar;

            //SPREAD ADDITIONAL DATA TO ITEM 

            const spread_converted_listing = {
                ...converted_listing,
                ...converted_listingRoomInfo,
                //  ...converted_listing_SITE, // Spread this first DEACTIVATED BY LODGIFY
                publicDescription: {
                    ...converted_listing.publicDescription,
                    //      ...converted_listing_SITE.publicDescription,
                    summary: converted_listingRoomInfo.publicDescription.summary
                },
                wixCms: ListingDetails_WIX,
                calendar: unavailableDates
            };
            return { item: spread_converted_listing };
        } catch (error) {
            console.error(
                "Error - ACTION - LODGIFY - fetching listing details :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        }
    },
    getListingReviews: async ({ internal_ID, params, wix_params }: actionsParams): Promise<CLIENT_LISTING_REVIEWS_RETURN> => {

        try {
            //Fetch WIX Site API to get revyoosHoldingId needed to fetch reviews from revyoos API
             const {item} =  await wixCmsFetchers.fetchListingDetails({ internal_ID, wix_params })
             const {revyoosHoldingId} = item;

        if (!revyoosHoldingId) {
            throw new Error("revyoosHoldingId not found in listing details");
        }
        // Fetch reviews from Revyoos API using the holding ID
            const response = await revyoosFetchers.fetchingReyoosListingReviews({ internal_ID, params, wix_params, auth:null,revyoosHoldingId });
           

            // Convert to client format
            const converted = new revyoos_listing_reviews_converter(response).convert();
            return converted;
        } catch (error) {
            console.error(
                "Error - ACTION - REVYOOS - fetching listing reviews :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        }
    }

};