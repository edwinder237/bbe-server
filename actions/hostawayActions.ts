import { handleFetch } from "../utils/handleFetching";
import getAuth from "../utils/getAuth";
import dayjs from "dayjs";
import {nomadStrLocations,nomadStrKey} from "./data/nomad-str";
import { getLocations } from "../utils/getLocations";

import {
    integrationTypes,
    actionsParams,
    Params,
    FetchResponse,
    handleFetchParams,
    CLIENT_LISTINGS_RETURN,
    CLIENT_LISTING_DETAILS_RETURN,
    CLIENT_LISTING_REVIEWS_RETURN,
    CLIENT_LISTING_CALENDAR_RETURN,
    CLIENT_LISTING_QUOTE_RETURN,
    FetchMap,
    ApiFetcherParams,
    CLIENT_LISTING_RESERVATION_RETURN,
    CLIENT_LISTING_PAYMENT_RETURN,
    CLIENT_LISTINGS_LOCATIONS_RETURN
} from "../utils/types";

import {
    hostawayListingsReturnType, hostawayCalendarObjecttype, hostaway_listing_reviews_returnType,
    hostawayDetailsReturnType, hostaway_listings,
    hostawayReservationCouponReturnType,
    hostawayReservationReturnType
} from "../utils/types/hostaway";

import {
    hostaway_listings_converter,
    hostaway_listing_reviews_converter,
    hostaway_listing_detail_converter,
    hostaway_listing_calendar_converter,
    hostaway_listing_quote_converter,
    hostaway_listing_addons_converter,

} from "../utils/clientConverter";
import { spread } from "lodash";
import { th } from "date-fns/locale";


const integrationType: integrationTypes = "hostaway";

interface hostawayApiFetcherParams {
    token: string;
    listingId?: string;
    params?: Params;
    queryParams?: URLSearchParams;
};

interface HostawayApiProp {
    endpointUrl: string;
    token: string;
    action: string;
    method: "GET" | "POST";
    body?: string;
}

interface HostawayApiReturn{
    count: number;
    limit: number;
    offset: number;
}


// Helper function to fetch data with 10 sec timeout
const fetchHostawayData = async ({ endpointUrl, token, action, method, body }: HostawayApiProp): Promise<any> => {
    const defaultOptions: RequestInit = {
        method: method,
        headers: {
            'Content-type': "application/x-www-form-urlencoded",
            'Cache-control': "no-cache",
            authorization: `Bearer ${token}`,
        },
    };

    function getOptionsRequest(action: string) {
        switch (action) {
            case "fetchListingQuote":
            case "fetchListingReservationCoupons":
            case "fetchListingReservation":
                return { ...defaultOptions, body };

            default:
                // Fallback: if the action isn't recognized, just return defaultOptions
                return defaultOptions;
        }
    }

    const options = getOptionsRequest(action);

    try {
        const response = await handleFetch({ fetchUrl: endpointUrl, options, action } as handleFetchParams) as FetchResponse;

        return response;

    } catch (error) {
        console.error(`Error in HOSTAWAY FETCHER: ${error.message}`);
        throw error;
    }

};

export const hostawayFetchers: FetchMap = {
    fetchListings: async ({ token, params }: ApiFetcherParams): Promise<hostawayListingsReturnType> => {
        const { offset, limit } = params
        const endpointUrl = `https://api.hostaway.com/v1/listings?limit=${limit}&offset=${offset}&sortOrder=&city=&match=&country=&isSyncig=&contactName=&propertyTypeId=`;
        const action = "fetchHostawayListings";
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "GET" })
        return response;


    },
    fetchListingsSearch: async ({ token, queryParams }: ApiFetcherParams) => {
        const endpointUrl = `https://api.hostaway.com/v1/listings?${queryParams}`;
        const action = "fetchHostawayListingsSearch";
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "GET" })
        return response;
    },
    fetchListingDetails: async ({ token, params }: ApiFetcherParams): Promise<hostawayDetailsReturnType> => {
        const { listingId } = params;
        const endpointUrl = `https://api.hostaway.com/v1/listings/${listingId}?includeResources=1`;
        const action = "fetchHostawayListingDetails";
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "GET" })
        return response;

    },
    fetchListingReviews: async ({ token, params }: ApiFetcherParams): Promise<hostaway_listing_reviews_returnType> => {
        const { listingId } = params;
        const endpointUrl = `https://api.hostaway.com/v1/reviews?listingMapIds[]=${listingId}`;
        const action = "fetchHostawayListingReviews";
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "GET" })
        return response;

    },
    fetchListingCalendar: async ({ token, params }: ApiFetcherParams) => {
        const { listingId, availabilities } = params;
        const { fromDate, toDate } = availabilities;

        // 1) Parse the input dates using dayjs
        const dayjsStart = dayjs(fromDate);
        const dayjsEnd = dayjs(toDate);

        // 2) Check validity
        if (!dayjsStart.isValid() || !dayjsEnd.isValid()) {
            throw new Error(`Invalid date range. fromDate: ${fromDate}, toDate: ${toDate}`);
        }

        // 3) Ensure both start and end are today or later - REMOVED DUE TO SERVER TIME SHIFT
        //const today = dayjs().startOf("day");
        //if (dayjsStart.isBefore(today)) {
        //    throw new Error(`fromDate cannot be earlier than today: ${fromDate}`);
        // }
        //if (dayjsEnd.isBefore(today)) {
        //     throw new Error(`toDate cannot be earlier than today: ${toDate}`);
        // }

        // 4) fromDate must not be after toDate
        if (dayjsStart.isAfter(dayjsEnd)) {
            throw new Error(`Invalid range: fromDate ${fromDate} is after toDate ${toDate}`);
        }

        // 5) Format as YYYY-MM-DD
        const startDate = dayjsStart.format("YYYY-MM-DD");
        const endDate = dayjsEnd.format("YYYY-MM-DD");

        // 6) Build the endpoint URL
        const endpointUrl = `https://api.hostaway.com/v1/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}&includeResources=`;
        const action = "fetchHostawayListingCalendar";

        // 7) Fetch the data
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "GET" });
        return response;

    },
    fetchListingQuote: async ({ token, params }: ApiFetcherParams) => {
        const { guestsCount, checkInDateLocalized, checkOutDateLocalized, addons } = params.quote;
        let couponId = null;
        // Only fetch coupon if a coupon value is provided in params.
        if (params.quote?.coupons) {
            const coupon_response = await hostawayFetchers.fetchListingReservationCoupons({ token, params, default_Lang: "en" });
            if (coupon_response.status === "success") {
                couponId = coupon_response?.result?.reservationCouponId;
            } else {
                throw new Error(`${coupon_response.message}`);
            }
        }

        const body = JSON.stringify({
            startingDate: checkInDateLocalized,
            endingDate: checkOutDateLocalized,
            numberOfGuests: guestsCount | 1,
            version: 2,
            reservationCouponId: couponId,
            components: addons?.map((addon) => ({
                listingFeeSettingId: addon.id,
                name: addon.type,
            }))
        });

        // 3) Construct the endpoint URL with the dynamic listingId
        const endpointUrl = `https://api.hostaway.com/v1/listings/${params.listingId}/calendar/priceDetails`;

        // 4) Provide the method ("POST") and the body
        const action = "fetchListingQuote";
        const method = "POST";
        const qute_response = await fetchHostawayData({ endpointUrl, token, action, method: "POST", body });

        return qute_response;

    },
    fetchListingReservationCoupons: async ({ token, params }: ApiFetcherParams): Promise<hostawayReservationCouponReturnType> => {
        const { listingId, quote } = params;
        const { coupons, checkInDateLocalized, checkOutDateLocalized } = quote;
        const endpointUrl = `https://api.hostaway.com/v1/reservationCoupons`;
        const action = "fetchListingReservationCoupons";
        const body = JSON.stringify({
            couponName: coupons.toString(),
            listingMapId: listingId,
            startingDate: checkInDateLocalized,
            endingDate: checkOutDateLocalized
        });
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "POST", body })
        return response;
    },
    fetchListingReservation: async ({ token, params }: ApiFetcherParams): Promise<hostawayReservationReturnType> => {
        const { listingId, quote, reservation } = params;
        const { dates } = reservation;
        const endpointUrl = `https://api.hostaway.com/v1/reservations?validatePaymentMethod=1`;
        const action = "fetchListingReservation";
        const body = JSON.stringify({
            channelId: 2000,
            listingMapId: parseInt(listingId),
            arrivalDate: dates.checkInDateLocalized,
            departureDate: dates.checkOutDateLocalized,
            guestName: reservation.guest.firstName + " " + reservation.guest.lastName,
            guestFirstName: reservation.guest.firstName,
            guestLastName: reservation.guest.lastName,
            guestEmail: reservation.guest.email,
            phone: reservation.guest.phone,
            numberOfGuests: reservation.guest.specialRequest,
            guestNote: reservation.guest.specialRequest,
            ccNumber: reservation.cc.ccNumber,
            ccName: reservation.cc.ccName,
            ccExpirationYear: reservation.cc.ccExpirationYear,
            ccExpirationMonth: reservation.cc.ccExpirationMonth,
            cvc: reservation.cc.cvc,
            totalPrice: reservation.totalPrice,
            financeField: reservation.financeField
        });
        const response = await fetchHostawayData({ endpointUrl, token, action, method: "POST", body });
        return response;
    }
}

export const hostawayActions = {
    getlistings: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "hostaway" });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;

            const listings = await hostawayFetchers.fetchListings({ token, params, default_Lang: "en" });
            // CONVERT LISTINGS TO FRONT END REQUIREMENTS 
            const converted_listings = listings.result.map((listing: hostaway_listings) => new hostaway_listings_converter(listing).convert());

            return { total: listings.count, items: converted_listings };

        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in HOSTAWAY ACTION - getListings:", error.message);
            throw error;
        }
    },
    getListingsLocations : async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_LOCATIONS_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "hostaway" });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }       
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;

            const spread_params = { ...params, limit: 1000, offset: 0 }
            const listings = await hostawayFetchers.fetchListings({ token, params:spread_params, default_Lang: "en" });
            // CONVERT LISTINGS TO FRONT END REQUIREMENTS
            const converted_listings = listings.result.map((listing: hostaway_listings) => new hostaway_listings_converter(listing).convert());
           
            // Gather unique city/state/country using a Set
            const uniqueCitySet = getLocations(converted_listings);

            const locations =  uniqueCitySet
            
            return {  items: locations, total: locations.length }

        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListings:", error.message);
            throw error;
        }
    },
    getListingsSearch: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTINGS_RETURN> => {

        const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType: "hostaway" });
        if (!tokenResponse.success) {
            throw new Error(`Token validation failed: ${tokenResponse.message}`);
        }
        if (!tokenResponse.token) {
            throw new Error("Token is undefined");
        }
        const token = tokenResponse.token;

        //  Extract and validate search parameters
        const { search } = params ?? {};
        if (!search) {
            throw new Error("Missing 'search' in params");
        }
        const { guestsCount, checkInDateLocalized, checkOutDateLocalized, location } = search;
        // Construct base query with defaults
        const queryParams = new URLSearchParams({
            limit: params.limit.toString(),
            offset: params.offset.toString(),
            sortOrder: "",
            city: "",
            country: "",
            propertyTypeId: "",
            availabilityGuestNumber: "0"
        });

        // Only add date range if both dates are provided
        if (checkInDateLocalized && checkOutDateLocalized) {
            const checkInDate = dayjs(checkInDateLocalized).format("YYYY-MM-DD");
            const checkOutDate = dayjs(checkOutDateLocalized).format("YYYY-MM-DD");
            queryParams.set("availabilityDateStart", checkInDate);
            queryParams.set("availabilityDateEnd", checkOutDate);
        }

        // Only add guests if provided
        if (typeof guestsCount === "number" && !isNaN(guestsCount)) {
            queryParams.set("availabilityGuestNumber", String(guestsCount));
        }
        // Only add location if provided
        if (typeof location.city === "string") {
            queryParams.set("city", location.city);
        }

        try {
            const response = await hostawayFetchers.fetchListingsSearch({ token, queryParams, default_Lang: "en" });

            // CONVERT LISTINGS TO FRONT END REQUIREMENTS 
            const converted_listings = response.result.map((listing: hostaway_listings) => new hostaway_listings_converter(listing).convert());

            return { total: response.count, items: converted_listings };

        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error ACTION - in getListingsSearch:", error.message);
            throw error;
        }




    },
    getListingDetails: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_DETAILS_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            // Concurrently fetch listing details and reviews
            const [listingDetailsResponse, reviewsResponse, calendarResponse] = await Promise.all([
                hostawayFetchers.fetchListingDetails({ token, params, default_Lang: "en" }),
                hostawayFetchers.fetchListingReviews({ token, params, default_Lang: "en" }),
                hostawayFetchers.fetchListingCalendar({ token, params, default_Lang: "en" })
            ]);

            const converted_details = new hostaway_listing_detail_converter(listingDetailsResponse.result).convert();
            const converted_reviews = new hostaway_listing_reviews_converter(reviewsResponse).convert();
            const converted_calendar = new hostaway_listing_calendar_converter(calendarResponse).convert();
            const spread_converted_details = {
                ...converted_details, calendar: converted_calendar,
                reviews: {
                    // Keep existing "reviews" data from converted_details
                    ...converted_details.reviews,
                    // Add or override "total" and "items"
                    total: converted_reviews.total,
                    items: converted_reviews.items
                }, wixCmx: {}
            }

            const response = { item: spread_converted_details };
            return response;

        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingDetails:", error.message);
            throw error;
        }
    },
    getListingReviews: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_REVIEWS_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const response = await hostawayFetchers.fetchListingReviews({ token, params, default_Lang: "en" })
            const reviews = new hostaway_listing_reviews_converter(response).convert();
            return reviews;
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingReviews:", error.message);
            throw error;
        }
    },
    getListingCalendar: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_CALENDAR_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            const response = await hostawayFetchers.fetchListingCalendar({ token, params, default_Lang: "en" })
            const calendar = new hostaway_listing_calendar_converter(response).convert();
            return calendar
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error in getListingCalendar:", error.message);
            throw error;
        }
    },
    getListingQuote: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_QUOTE_RETURN> => {
        const { checkInDateLocalized, checkOutDateLocalized, guestsCount } = params.quote;
        try {
            const tokenResponse = await getAuth({
                internal_ID,
                needNewToken: false,
                integrationType,
            });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;


            const response = await hostawayFetchers.fetchListingQuote({ token, params, default_Lang: "en" });

            // Parse dates with dayjs (assumes "YYYY-MM-DD")
            const checkInDate = dayjs(checkInDateLocalized, "YYYY-MM-DD");
            const checkOutDate = dayjs(checkOutDateLocalized, "YYYY-MM-DD");

            // Calculate number of nights
            const nights = checkOutDate.diff(checkInDate, "day");
            const spread_quote = {
                ...response,
                result: {
                    ...response.result,
                    lengthOfStay: nights,
                    checkInDateLocalized: checkInDate,
                    checkOutDateLocalized: checkOutDate,
                    guestsCount: guestsCount,
                },
            };
            const converted_quote = new hostaway_listing_quote_converter(spread_quote).convert();
            return {item: converted_quote };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error ACTION - in getListingQuote:", error.message);
            throw error;
        }
    },
    getListingPayment: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_PAYMENT_RETURN> => {
        const { default_Lang } = params;
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;

            const [listingDetails] = await Promise.all([
                hostawayFetchers.fetchListingDetails({ token, params, default_Lang }),
            ]);
            const converted_addons = new hostaway_listing_addons_converter(listingDetails.result).convert();
            const converted_details = new hostaway_listing_detail_converter(listingDetails.result).convert();
            const return_addons = { items: converted_addons, total: converted_addons.length };

            const spread_converted_details = {
                ...converted_details, addons: return_addons || { total: 0, items: [] }
            }
            return { item: spread_converted_details };
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error ACTION - in getListingPayment:", error.message);
            throw error;
        }

    },
    getListingReservation: async ({ internal_ID, params }: actionsParams): Promise<CLIENT_LISTING_RESERVATION_RETURN> => {
        try {
            const tokenResponse = await getAuth({ internal_ID, needNewToken: false, integrationType });
            if (!tokenResponse.success) {
                throw new Error(`Token validation failed: ${tokenResponse.message}`);
            }
            if (!tokenResponse.token) {
                throw new Error("Token is undefined");
            }
            const token = tokenResponse.token;
            // fetch financeField from lsting
            const [quote] = await Promise.all([hostawayFetchers.fetchListingQuote({ token, params, default_Lang: "en" })]);
            const financeField = quote.result.components;
            const totalPrice = quote.result.totalPrice;
            // console.log("PRICE", totalPrice, quote.result.components)
            const spread_params = { ...params, reservation: { ...params.reservation, totalPrice: totalPrice, financeField: financeField } }
            const reservation_response = await hostawayFetchers.fetchListingReservation({ token, params: spread_params, default_Lang: "en" })
            const reservation = { item: reservation_response };
            //console.log(reservation)
            return reservation;
        } catch (error: any) {
            // Log error details for production monitoring
            console.error("Error ACTION - in getListingReservation:", error.message);
            throw error;
        }
    }

}



