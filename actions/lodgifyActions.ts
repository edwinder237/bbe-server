import { handleFetch } from "../utils/handleFetching";
import dayjs from "dayjs"
import { filterUnavailableDates } from "../utils/filterUnavailableDates";
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
    lodgify_listing_calendar_converter,
    lodgify_listings_rateCalendar_converter
} from "../utils/clientConverter";


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

// Helper function to fetch Lodgify data with timeout
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
    fetchListingCalendar: async ({ auth, params }: ApiFetcherParams): Promise<lodgifyListingCalendarReturnType> => {
        const { listingId, availabilities } = params;
        const { fromDate, toDate } = availabilities;
        const fromDateISO = dayjs(fromDate).toISOString();
        const toDateISO = dayjs(toDate).toISOString();
        const method = "GET";
        const endpointUrl = `https://api.lodgify.com/v1/availability/${listingId}?periodStart=${fromDateISO}&periodEnd=${toDateISO}`;
        const lodgifyAuth = auth;
        const action = "fetchLodgifyListingCalendar";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth, action, method, default_Lang: "en" });
        return response;
    },
    fetchListingRoomInfo: async ({ auth, params }: ApiFetcherParams): Promise<lodgifyListingRoomInfoReturnType> => {
        const { listingId, websiteId, default_Lang } = params; // Extract relevant params
        if (!params.roomId) console.warn(" RoomId is missing")
        const endpointUrl = `https://api.lodgify.com/v1/properties/${listingId}/rooms/${params.roomId}?wid=${websiteId}`;
        const action = "fetchLodgifyListingInfo";
        const method = "GET";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth: auth, method, action, default_Lang });
        return response;
    },
    fetchListingQuote: async ({ auth, params }: ApiFetcherParams): Promise<lodgifyListingQuoteReturnType> => {
        const { listingId, quote, default_Lang } = params;
        const { checkInDateLocalized, checkOutDateLocalized, guestsCount, currency } = quote;

        const endpointUrl = `https://checkout.lodgify.com/api/v1/checkout/price?propertyId=${listingId}&arrival=${checkInDateLocalized}&departure=${checkOutDateLocalized}&guests=${guestsCount}&currency=${currency}`;
        const action = "fetchLodgifyListingQuote";
        const method = "GET";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth: auth, method, action, default_Lang });
        return response;
    },
    fetchListingCurrencies: async ({ auth, params }) => {
        const { default_Lang } = params;
        const endpointUrl = `https://api.lodgify.com/v1/currencies/${params?.currency}`;;
        const action = "fetchLodgifyCurrencies";
        const lodgifyAuth = auth;
        const method = "GET";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth, action, method, default_Lang });
        return response
    },
    fetchListingsRatesCalendar: async ({ auth, params }) => {
        const { default_Lang, availabilities, listingId, roomId } = params;
        const { fromDate, toDate } = availabilities;

        const endpointUrl = `https://api.lodgify.com/v2/rates/calendar?RoomTypeId=${roomId}&HouseId=${listingId}&StartDate=${fromDate}&EndDate=${toDate}`;;
        const action = "fetchLodgifyRatesCalendar";
        const lodgifyAuth = auth;
        const method = "GET";
        const response = await fetchLodgifyData({ endpointUrl, lodgifyAuth, action, method, default_Lang });
        return response
    }

};

export const lodgifyActions = {
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
    getListingSearch: async ({ internal_ID, params, wix_params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {
        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;

        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        }
        const keysObject: lodgifyAuthParams = { appKey: AppKey, apiKey: ApiKey };
        try {

            const { search, lodgifySite, default_Lang } = params;
            const validDates = !!search.checkInDateLocalized && !!search.checkOutDateLocalized;
            const checkInDate = dayjs(search.checkInDateLocalized).format('YYYY-MM-DD');
            const checkOutDate = dayjs(search.checkOutDateLocalized).format('YYYY-MM-DD');
            const searchParams = {
                guestsCount: search.guestsCount || 0,
                checkInDateLocalized: checkInDate || "",
                checkOutDateLocalized: checkOutDate || "",
                location: { city: "", state: "", country: "" }
            };
            const paramsProps = { id: lodgifySite?.id, url: lodgifySite?.url };

            const getSearchResults = async (auth): Promise<any> => {
                // Parallelize data fetching where possible
                const [allListings, availabilities] = await Promise.all([
                    //getAllListing allows search on all listing to filter location etc. getListing is use on initial fetch for pagination.
                    lodgifyActions.getAllListings({ internal_ID, params: { ...params, lodgifySite: paramsProps, search: searchParams }, wix_params, auth }),
                    validDates
                        ? lodgifyFetchers.fetListingsSearch({ auth, params, default_Lang })
                        : Promise.resolve([]) // No availabilities needed if dates are invalid
                ]);

                // Early exits for invalid or empty listings
                if (!allListings.items?.length) {
                    return {
                        total: 0,
                        items: [],
                        error: allListings.items ? 'No listings found' : 'Invalid listings format: missing items array'
                    };
                }

                // Initialize filters
                let filteredListings = allListings.items;
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
                if (search.location?.state) {
                    const state = search.location.state;

                    filteredListings = filteredListings.filter(
                        (listing: any) =>
                            listing.address.state === state || listing.moreinfo?.city_name === state
                    );
                    appliedFilters.push(`location: ${state}`);
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
                        (listing: CLIENT_LISTINGS_OBJECT) => listing.lodgifySiteApi?.max_people >= requestedGuests
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

                // If no dates, no city, and no guest count are passed, return total as allListings.total.
                if (
                    !search.checkInDateLocalized &&
                    !search.checkOutDateLocalized &&
                    !search.location.city


                ) {
                    return {
                        total: filteredListings.length,
                        items: filteredListings,
                        message,
                    };
                }

                return {
                    total: filteredListings.length,
                    items: filteredListings,
                    message
                };
            };
            const searchResult = await getSearchResults(keysObject);

            return { total: searchResult.total, items: searchResult.items };

        } catch (error) {
            console.error("Error ACTION - fetching Listings_search:", error.message);
            throw new Error(`Fetching failed: ${error.message}`);
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
            const [listingDetails, listingDetails_SITE, calendar] = await Promise.all([
                lodgifyFetchers.fetchListingDetails({ internal_ID, auth: keysObject, params, default_Lang }),
                lodgifySiteFetchers.fetchSiteListingDetails({ auth: keysObject, params, default_Lang }),
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
            const converted_listing = new lodgify_listing_details_converter(listingDetails as lodgifyListingDetailsObjectType).convert();

            //LISTING DETAILS (lodgify site api) ** gets addional data missing from other apis 
            const converted_listing_SITE = new lodgify_listing_details_SITE_converter(listingDetails_SITE as unknown as Lodgify_Listing_Details_SITE_ObjectType).convert();

            //ROOM INFO 
            const converted_listingRoomInfo = new lodgify_listing_roomInfo_converter(roomInfo as lodgifyListingRoomInfoObjectType).convert();
            //CALENDAR 
            const converted_calendar = new lodgify_listing_calendar_converter(calendar as lodgifyListingCalendarObectType[]).convert();

            const converted_calendar_MinDays = filterUnavailableDates(converted_calendar) ;
          
            // Filter out dates with min stay only for the specific internal_ID
            // this is used when client request a min bookable dates on their calendar
            const unavailableDates = internal_ID !== "f9ae756d-be1b-4593-87aa-c245416e4ae7" ? (converted_calendar) :
                (converted_calendar_MinDays);


            //SPREAD ADDITIONAL DATA TO ITEM 

            const spread_converted_listing = {
                ...converted_listing,
                ...converted_listingRoomInfo,
                ...converted_listing_SITE, // Spread this first
                publicDescription: {
                    ...converted_listing.publicDescription,
                    ...converted_listing_SITE.publicDescription,
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
    getListingQuote: async ({ auth, params }: actionsParams): Promise<CLIENT_LISTING_QUOTE_RETURN> => {
        try {
            const { default_Lang } = params;

            const response = await lodgifyFetchers.fetchListingQuote({ auth, params, default_Lang })

            if (response.error) {
                throw new Error(response.error)
            }

            const QUOTE = new lodgify_listing_quote_converter(response);
            const CONVERTED_QUOTE = QUOTE.convert();

            return { item: CONVERTED_QUOTE };
        } catch (error) {
            console.error("Error ACTION - fetching quote data:", error);
            throw error
        }
    },
    getListingCurrencies: async ({ internal_ID, params }: actionsParams): Promise<any> => {
        const { default_Lang } = params;
        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;
        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        };
        try {
            const keysObject: lodgifyAuthParams = { appKey: AppKey, apiKey: ApiKey };
            const response = await lodgifyFetchers.fetchListingCurrencies({ auth: keysObject, params, default_Lang })
            return response;

        } catch (error) {
            console.error(
                "Error - ACTION - fetching listing currencies :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        };

    },
    getListingCalendar: async ({ internal_ID, params }: actionsParams): Promise<any> => {
        const { default_Lang } = params;
        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;
        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        };
        try {
            const keysObject: lodgifyAuthParams = { appKey: AppKey, apiKey: ApiKey };
            const response = await lodgifyFetchers.fetchListingCalendar({ auth: keysObject, params, default_Lang })
            return response;

        } catch (error) {
            console.error(
                "Error - ACTION - fetching listing Calendar :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        };

    },
    getListingsLocations: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_LOCATIONS_RETURN> => {
        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;
        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        };
        try {
            const keysObject: lodgifyAuthParams = { appKey: AppKey, apiKey: ApiKey };

            const spread_params = { ...params, pageNum: 1, size: 1000 }
            const listings = await lodgifyFetchers.fetchAllListings({ auth: keysObject, params: spread_params, default_Lang: "en" })

            const converted_listings = listings.items
                .filter((lst: lodgifyListingsObjectTpye) => lst.is_active)
                .map((listing: lodgifyListingsObjectTpye) =>
                    new lodgify_listings_converter(listing).convert()
                );

            // ---------------------------------------------------------
            // 4) OPTIMIZED: Gather unique city/state/country using a Set
            // ---------------------------------------------------------
            const uniqueCitySet = new Set();
            const cityResults: { city: string; state: string; country: string }[] =
                [];
            for (const item of converted_listings) {
                const { city, state, country } = item.address;
                const key = `${city}||${state}||${country}`;
                if (!uniqueCitySet.has(key)) {
                    uniqueCitySet.add(key);
                    cityResults.push({ city, state, country });
                }
            }

            return { items: cityResults, total: listings.count };

        } catch (error) {
            console.error(
                "Error - LODGIFY ACTION - fetching listing locations :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        };

    },
    getListingsRateCalendar: async ({ internal_ID, params }: actionsParams): Promise<any> => {
        const { default_Lang, listingId, roomId } = params;
        if (!listingId || !roomId) {
            throw new Error("Missing listingId or roomId");
        }
        const keys = await getLodgifyKeys(internal_ID);
        const { ApiKey, AppKey } = keys.client;
        if (!ApiKey || !AppKey) {
            throw new Error("Missing Lodgify API keys");
        };
        try {
            const keysObject: lodgifyAuthParams = { appKey: AppKey, apiKey: ApiKey };
            const response = await lodgifyFetchers.fetchListingsRatesCalendar({ auth: keysObject, params, default_Lang })
            const converted_rates = new lodgify_listings_rateCalendar_converter(response).convert();

            return { item: converted_rates };

        } catch (error) {
            console.error(
                "Error - ACTION - fetching Rates Calendar :",
                error.message
            );
            throw new Error(`Fetching failed: ${error.message}`);
        };

    },
};
