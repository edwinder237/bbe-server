import type { VercelRequest, VercelResponse } from "@vercel/node";
import { incrementRequestCount } from "../utils/requestMetrics";
import { corsMiddleware } from "../utils/corsMiddleware";
import { hostawayActions, hostawayFetchers } from "../actions/hostawayActions";
import { guestyActions, guestyFetchers } from "../actions/guestyActions";
import { lodgifyActions } from "../actions/lodgifyActions";
import { revyoosActions } from "../actions/revyoosActions";



import {
    CLIENT_LISTINGS_RETURN,
    actionsParams,
    ActionsMap,
} from "../utils/types";
import { wixCmsFetchers } from "../actions/wixCmsActions";
import { ac } from "@upstash/redis/zmscore-Dc6Llqgr";


const actions: ActionsMap = {
    //////////////WIXCMS ACTIONS////////
    getWixCms_Listings: async ({ wix_params }) => {
        return wixCmsFetchers.fetchListings({ wix_params });
    },
    getWixCms_ListingDetails: async ({ internal_ID, wix_params }) => {
        return wixCmsFetchers.fetchListingDetails({ internal_ID, wix_params });
    },
    //////////////GUESTY ACTIONS////////
    getGuesty_Listings: async ({ internal_ID, params }: actionsParams) => {
        return guestyActions.getlistings({ internal_ID, params })
    },
    getGuesty_NextPage: async ({ internal_ID, params }: actionsParams) => {
        return guestyActions.getlistingsNextPage({ internal_ID, params })
    },
    getGuesty_ListingDetails: async ({ internal_ID, params }) => {
        return guestyActions.getListingDetails({ internal_ID, params })
    },
    getGuesty_ListingAvailabilities: async ({ internal_ID, params }) => {
        return guestyActions.getListingCalendar({ internal_ID, params })
    },
    getGuesty_PaymentPage: async ({ internal_ID, params }) => {
        return guestyActions.getListingPayment({ internal_ID, params });
    },
    getGuesty_ListingReservation: async ({ internal_ID, params }) => {
        return guestyActions.getListingReservation({ internal_ID, params })
    },
    getGuesty_ListingQuote: async ({ internal_ID, params }) => {
        return guestyActions.getListingQuote({ internal_ID, params });
    },
    getGuesty_ListingsSearch: async ({ internal_ID, params }) => {
        return guestyActions.getListingSearch({ internal_ID, params });
    },
    getGuesty_ListingLocations: async ({ internal_ID, params }) => {
        return guestyActions.getListingLocations({ internal_ID, params });
    },

    //////////////LODGIFY ACTIONS////////
    getLodgify_test: async ({ internal_ID, params, wix_params, auth }) => {
        return hostawayActions.getListingsLocations({ internal_ID, params, wix_params })
    },
    getLodgify_Listings: async ({ internal_ID, params, wix_params, auth }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {
        return lodgifyActions.getListings({ internal_ID, params, wix_params, auth });
    },
    getLodgify_ListingLocations: async ({ internal_ID, params, wix_params }) => {
        return lodgifyActions.getListingsLocations({ internal_ID, params, wix_params });
    },

    getLodgify_Listings_search: async ({ internal_ID, params, wix_params }) => {
        return lodgifyActions.getListingSearch({ internal_ID, params, wix_params });
    },
    getLodgify_ListingCalendar: async ({ internal_ID, params, wix_params }) => {
        return lodgifyActions.getListingCalendar({ internal_ID, params, wix_params });
    },
    getLodgify_ListingDetails: async ({ internal_ID, params, wix_params }) => {
        return lodgifyActions.getListingDetails({ internal_ID, params, wix_params });
    },
    getLodgify_ListingQuote: async ({ auth, params, internal_ID }) => {
        return lodgifyActions.getListingQuote({ internal_ID, auth, params });
    },
    getLodgify_ListingApiQuote: async ({ auth, params, internal_ID }) => {
        return lodgifyActions.getListingApiQuote({ internal_ID, auth, params });
    },
    getLodgify_ListingCurrencies: async ({ internal_ID, params }) => {
        return lodgifyActions.getListingCurrencies({ internal_ID, params });
    },
    getLodgify_ListingsRateCalendar: async ({ internal_ID, params }) => {
        return lodgifyActions.getListingsRateCalendar({ internal_ID, params });
    },

    ///////////////HOSTAWAY ACTIONS////////
    getHostaway_Locations: async ({ internal_ID, params, wix_params, auth }) => {
        return hostawayActions.getListingsLocations({ internal_ID, params, wix_params })
    },
    getHostaway_Listings: async ({ internal_ID, params }: actionsParams) => {
        return hostawayActions.getlistings({ internal_ID, params });
    },
    getHostaway_ListingsSearch: async ({ internal_ID, params }: actionsParams) => {
        return hostawayActions.getListingsSearch({ internal_ID, params });
    },
    getHostaway_LisingDetails: async ({ internal_ID, params }: actionsParams) => {
        return hostawayActions.getListingDetails({ internal_ID, params });
    },
    getHostaway_LisingReviews: async ({ internal_ID, params }: actionsParams) => {
        return hostawayActions.getListingReviews({ internal_ID, params });
    },
    getHostaway_ListingCalendar: async ({ internal_ID, params }: actionsParams) => {
        return hostawayActions.getListingCalendar({ internal_ID, params });
    },
    getHostaway_ListingQuote: async ({ internal_ID, params }: actionsParams) => {
        return hostawayActions.getListingQuote({ internal_ID, params });
    },
    getHostaway_PaymentPage: async ({ internal_ID, params }) => {
        return hostawayActions.getListingPayment({ internal_ID, params });
    },
    getHostaway_ListingReservation: async ({ internal_ID, params }) => {
        return hostawayActions.getListingReservation({ internal_ID, params });
    },
    //////////////REVYOOS INTEGRATION ACTIONS////////
    getRevyoos_ListingReviews: async ({ internal_ID, params, wix_params, auth }) => {
        return revyoosActions.getListingReviews({ internal_ID, params, wix_params, auth });
    },

};

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Validate CORS

    const isPreflight = corsMiddleware(req, res);
    if (isPreflight) return;

    try {
        const { action, internal_ID, params, wix_params } = req.body;
        if (req.headers['x-vercel-warmup']) {
            return res.status(200).json({ message: 'Warm-up request ignored' });
        }

        // Increment the request count (PROD ONLY)
        //await incrementRequestCount(internal_ID);

        if (action?.startsWith("getRevyoos")) {
            
            if (actions[action]) {
                const actionResults = await actions[action]({ internal_ID, params, wix_params });
                return res.status(200).json(actionResults);
            } else {
                return res.status(400).json({ error: "Invalid Revyoos action" });
            }
        } else
        if (action?.startsWith("getWixCms")) {

            if (!wix_params.siteURL) {
                throw new Error("ERROR in WIX CMS REQ: Missing siteURL in params");
            }

            if (actions[action]) {
                //params must have siteURL KEY WHICH IS PASSED FOR THE CALL
                const actionResults = await actions[action]({ internal_ID, wix_params });
                return res.status(200).json(actionResults);
            } else {
                return res.status(400).json({ error: "Error fetching WIX CMS" });
            }
        } if (action?.startsWith("getHostaway")) {

            const actionName = action as keyof typeof actions;

            if (typeof actions[actionName] === "function") {
                const actionResults = await actions[action]({ internal_ID, params, wix_params });
                return res.status(200).json(actionResults);
            } else {
                return res.status(400).json({ error: "Invalid Hostaway action" });
            }
        } if (action?.startsWith("getGuesty")) {
            const actionName = action as keyof typeof actions;

            if (actions[actionName]) {
                const actionResults = await actions[actionName]({ internal_ID, params, wix_params });
                return res.status(200).json(actionResults);
            } else {
                return res.status(400).json({ error: "Invalid Guesty action" });
            }
        } if ((action?.startsWith("getLodgify"))) {

            if (actions[action]) {

                try {
                    const fetchResults = await actions[action]({ internal_ID, params, wix_params });
                    return res.status(200).json(fetchResults);
                } catch (error) {
                    console.error("Error CONTROLLER fetching Lodgify data:", error.message);
                    return res.status(500).json({
                        error: "Failed to fetch Lodgify data",
                        message: error.message,
                    });
                }
            } else {
                return res.status(400).json({ error: "Invalid Lodgify action" });
            }
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }
    } catch (error) {
        console.error("Error in controller handler:", error.message);
        return res
            .status(500)
            .json({ error: "Internal Server Error", message: error.message });
    }
}


