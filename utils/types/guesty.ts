////GUESTY///
// ReturnType = Data returned from the API || CAMELCASE
// ObjectType = Object type returned from API e.g.; lodgifyListingDetailsObjectType || CAMELCASE
// ParamType = Data passed to the API  || CAMELCASE

///GUESTY API REQUESTS 

//LISTINGS 
export type guestyListingsObjectType = {
    _id: string;
    title: string;
    type: string;
    roomType: string;
    propertyType: string;
    amenities: string[];
    bathrooms: number;
    accommodates: number;
    bedrooms: number;
    beds: number;
    timezone: string;
    address: {
        city: string;
        country: string;
        full: string;
        lat: number;
        lng: number;
        state: string;
        street: string;
    };
    picture: {
        thumbnail: string;
        regular: string;
        large: string;
        caption: string;
    };
    pictures: Array<{
        original: string;
        large: string;
        regular: string;
        thumbnail: string;
        caption: string;
    }>;
    prices: {
        basePrice: number;
        currency: string;
    };
    publicDescription: {
        summary: string;
    };
    reviews: {
        avg: number;
        total: number;
    };
    nickname: string;
    tags: string[];
    areaSquareFeet: number;
};
export type guestyListingsReturnType = {
    results: guestyListingsObjectType[];
    pagination?: {
        total: number;
        cursor: {
            next: string;
        }
    };
}
//LISTING DETAILS 
export type guestylistingDetailsObjectType = {
    _id: string;
    title: string;
    nickname: string;
    type: string;
    roomType: string;
    propertyType: string;
    accommodates: number;
    amenities: string[];
    bathrooms: number;
    bedrooms: number;
    beds: number;
    timezone: string;
    defaultCheckInTime: string;
    defaultCheckOutTime: string;
    address: {
        city: string;
        country: string;
        full: string;
        lat: number;
        lng: number;
        state: string;
        street: string;
    };
    picture: {
        thumbnail: string;
    };
    pictures: {
        original: string;
        large?: string;
        regular?: string;
        thumbnail: string;
        caption?: string;
    }[];
    prices: {
        max_price: number
        basePrice: number;
        currency: string;
        monthlyPriceFactor: number;
        weeklyPriceFactor: number;
        extraPersonFee: number;
        cleaningFee: number;
        petFee: number;
    };
    publicDescription: {
        transit: string,
        neighborhood: string,
        space: string;
        access: string;
        notes: string;
        interactionWithGuests: string;
        summary: string;
        houseRules: string;
    };
    terms: {
        minNights: number;
        maxNights: number;
    };
    taxes: any[]; // Assuming it's an array but not defined in the example
    reviews: {
        avg: number;
        total: number;
    };
    tags: string[];
    parentId: string | null;
};
export type guestyListingDetailsReturnType = guestylistingDetailsObjectType;
;
export type guestyListingCalendarObjectType = {
    date: string; // Date in the format YYYY-MM-DD
    minNights: number;
    isBaseMinNights: boolean;
    status: string; // Could be an enum ('available', 'unavailable', etc.)
    cta: boolean; // Call to action
    ctd: boolean; // Call to action disabled
};
export type guestyListingCalendarReturnType = guestyListingCalendarObjectType[];

export type guestyListingsLocationObjectType = {
    city: string;
    country: string;
    state: string;
};
export type guestyListingsLocationReturnType = {
    results: guestyListingsLocationObjectType[];
    count: number;
    skip: number;
    limit: number;
};




// LISTING CALANDAR
export type lodgifyListingCalendarObectType = {
    property_id: number;
    room_type_id: number;
    period_start: string;
    period_end: string;
    available: number;
    total_units: number;
    total_overbooked: number;
    is_available: boolean;
    booking_ids: number[];
    closed_period_id: number;
};
export type lodgifyListingCalendarReturnType = lodgifyListingCalendarObectType[];


//LISTING QUOTE 
export type guestyListingQuoteObjectType = {
    _id: string;
    createdAt: string; // ISO date string
    expiresAt: string; // ISO date string
    accountId: string;
    guestsCount: number;
    channel: string;
    source: string;
    unitTypeId: string;
    checkInDateLocalized: string; // Date in the format YYYY-MM-DD
    checkOutDateLocalized: string; // Date in the format YYYY-MM-DD
    rates: {
        ratePlans: {
            ratePlan: {
                _id: string;
                name: string;
                priceAdjustment: {
                    type: string; // Could be an enum ('flat', etc.)
                    direction: string; // Could be an enum ('increase', 'decrease', etc.)
                    amount: number;
                };
                type: string;
                mealPlans: any[]; // Modify if you have a specific structure for meal plans
                cancellationPolicy: null | string; // Adjust if more details about policy exist
                cancellationFee: null | number; // Could be null or a fee amount
                description: string;
                minNights: number;
                rateStrategies: any[]; // Modify based on rate strategies structure
                money: {
                    _id: string;
                    currency: string;
                    fareAccommodation: number;
                    fareAccommodationAdjusted: number;
                    fareCleaning: number;
                    totalFees: number;
                    subTotalPrice: number;
                    hostPayout: number;
                    hostPayoutUsd: number;
                    totalTaxes: number;
                    invoiceItems: {
                        title: string;
                        amount: number;
                        currency: string;
                        type: string;
                        normalType: string; // Could be an enum like ('AF', 'CF', 'TT', 'LT')
                    }[];
                };
            };
            inquiryId: string;
            days: {
                date: string; // Date in the format YYYY-MM-DD
                currency: string;
                rateStrategy: number;
                ratePlan: number;
                minNights: number;
                maxNights: number;
                manualPrice: number;
                lengthOfStay: number;
                price: number;
            }[];
        }[];
    };
    coupons: {
        name: string; //"testing",
        couponCode: string;// "DISCOUNT30",
        discountType: string;// "PERCENT",
        discount: number;
    }[]; // Modify based on coupon structure
    numberOfGuests: {
        numberOfAdults: number;
    };
    __v: number;
    status: string;
    promotions: object; // Modify based on the promotions structure
};
export type guestyListingQuoteReturnType = guestyListingQuoteObjectType;

//RESERVATION 
export type guestyListingReservationObjectType = {
    _id: string;
    createdAt: string;
    customFields: any[]; // Specify type if known
    status: "confirmed" | "pending" | "cancelled"; // Extend with other possible statuses
    stay: {
        checkInDateLocalized: string;
        checkOutDateLocalized: string;
        guestsCount: number;
        numberOfGuests: {
            numberOfAdults: number;
            numberOfChildren?: number; // Optional if not provided
            numberOfInfants?: number; // Optional if not provided
        };
        unitTypeId: string;
        unitId: string;
        eta: string; // Estimated Time of Arrival in ISO format
        etd: string; // Estimated Time of Departure in ISO format
        ratePlanId: string;
    }[];
    platform: "direct" | "OTA" | string; // Extend with possible platforms
    confirmationCode: string;
    accountId: string;
    source: "BE-API" | "OTA" | string; // Extend with possible sources
    confirmedAt: string;
    guestStay: {
        status: "not_set" | "checked_in" | "checked_out" | string; // Extend with possible statuses
        createdAt: string;
        updatedAt: string;
    };
    __v: number;
    ratePlanId: string;
    unitTypeId: string;
    guestsCount: number;
    numberOfGuests: {
        numberOfAdults: number;
        numberOfChildren?: number; // Optional if not provided
        numberOfInfants?: number; // Optional if not provided
    };
    checkInDateLocalized: string;
    checkOutDateLocalized: string;
    eta: string; // Estimated Time of Arrival in ISO format
    etd: string; // Estimated Time of Departure in ISO format
    unitId: string;
    guestId: string;
};

//REVIEWS
export type guestyListingReviewsObjectType = {
    _id: string;
    externalReviewId: string;
    accountId: string;
    channelId: string;
    createdAt: string;
    createdAtGuesty: string;
    externalListingId: string;
    externalReservationId: string;
    guestId: string;
    listingId: string;
    rawReview: { //must all have null as rawReviews depends on the vendor
        //hostaway
        status: string | null; //must be APPROVED
        brandName: string | null;
        source: string | null;
        createdDateTime: string | null;
        lastUpdatedDateTime: string | null;
        title: { value: string; locale: string } | null;
        body: { value: string; locale: string } | null;
        starRatingOverall: string | null;  ///***RATING KEY ***///

        //AirBnb
        hidden?: boolean | null;
        overall_rating: number | null;  ///***RATING KEY ***///
        public_review: string | null;
        expires_at: string | null;
        submitted_at: string;
        //Booking.com

        created_timestamp: string | null;
        content: { headline: string } | null,
        scoring: { review_score: number } | null,  ///***RATING KEY ***///

    },
    reservationId: string;
    updatedAt: string;
    updatedAtGuesty: string;
    reviewReplies: any[]; // Adjust this type if needed
};

export type guestyListingReviewsReturnType = {
    data: guestyListingReviewsObjectType[];
    limit: number | 0;
    skip: number | 0;
};