
// LOGIFY DATA FORMAT
export type lodgify_listings = {
  id: number;
  name: string;
  internal_name: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address: string;
  hide_address: boolean;
  zip: string;
  city: string;
  state: string;
  country: string;
  image_url: string;
  rating: number;
  price_unit_in_days: number;
  min_price: number;
  original_min_price: number;
  original_max_price: number;
  max_price: number;
  rooms: Array<{ id: number; name: string }>;
  currency_code: string;
  is_active: boolean;
  subscription_plans: string[];
  contact: {
    spoken_languages: string[];
  };
  in_out_max_date: string;
  has_addons: boolean;
  has_agreement: boolean;
  agreement_text: any,
  agreement_url: any,
  in_out: {
    check_in:{
      date:string,
      for:string
    }[],
    check_out:{
      date:string,
      for:string
    }[],
    not_available:{
      date:string,
      for:string
    }[],
  },
  
  created_at: string;
  updated_at: string;
};
export type lodgify_listings_details = {
  id: number;
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  image_url: string;
  has_addons: boolean;
  has_agreement: boolean;
  agreement_text: string | null;
  agreement_url: string | null;
  owner: {
    spoken_languages: string[];
  };
  rating: number;
  price_unit_in_days: number;
  min_price: number;
  original_min_price: number;
  max_price: number;
  original_max_price: number;
  rooms: Array<{
    id: number;
    name: string;
    image_url: string;
    max_people: number;
    units: number;
    has_wifi: boolean;
    has_meal_plan: boolean;
    bedrooms: number;
    bathrooms: number;
    area_unit: string;
    area: number;
    min_price: number;
    original_min_price: number;
    max_price: number;
    original_max_price: number;
    price_unit_in_days: number;
    currency: {
      id: number;
      code: string;
      name: string;
      euro_forex: number;
      symbol: string;
    };
  }>;
  in_out_max_date: string;
  in_out: {
    is_restricted: boolean;
    check_in: Array<{ date: string; for: number }>;
    check_out: Array<{ date: string; for: number }>;
    not_available: Array<{ date: string; for: number }>;
  };
  currency: {
    id: number;
    code: string;
    name: string;
    euro_forex: number;
    symbol: string;
  };
  subscription_plans: string[];
};
export type Property_info_by_Id_includeInOut = {
  id: number;
  name: string;
  internal_name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  hide_address: boolean;
  zip: string;
  city: string;
  state: string;
  country: string;
  image_url: string;
  has_addons: boolean;
  has_agreement?: boolean;
  agreement_text?: string;
  agreement_url?: string | null;
  contact: {
    spoken_languages: string[]; // Array of language codes like "EN"
  };
  rating: number;
  price_unit_in_days: number;
  min_price: number;
  original_min_price: number;
  max_price: number;
  original_max_price: number;
  rooms: {
    id: number;
    name: string;
    image_url: string; // URL of the room image
    max_people: number; // Maximum occupancy
    units: number; // Number of units
    has_wifi: boolean; // Indicates if the room has Wi-Fi
    has_meal_plan: boolean; // Indicates if the room includes a meal plan
    bedrooms: number; // Number of bedrooms
    bathrooms: number; // Number of bathrooms
    area_unit: string; // Unit of area measurement (e.g., "sqf")
    area: number; // Area size of the room
    min_price: number; // Minimum price
    original_min_price: number; // Original minimum price
    max_price: number; // Maximum price
    original_max_price: number; // Original maximum price
    price_unit_in_days: number; // Number of days the price covers
    currency: {
      id: number; // Currency ID
      code: string; // Currency code (e.g., "USD")
      name: string; // Name of the currency
      euro_forex: number; // Forex rate in Euro
      symbol: string; // Currency symbol (e.g., "$")
    };
  }[];
  in_out_max_date: string;
  in_out: {
    is_restricted: boolean;
    check_in: {
      date: string;
      for: string;
    }[];
    check_out: {
      date: string;
      for: string;
    }[];
    not_available: {
      date: string;
      for: string;
    }[];
  };
  currency: {
    id: number;
    code: string;
    name: string;
    euro_forex: number;
    symbol: string;
  }
  currency_code?: string;
  created_at: string; // or Date depending on usage
  updated_at: string; // or Date depending on usage
  is_active: boolean;
  subscription_plans: string[];

};
export type Lodgify_Listing_Details_BETA = {
  addressInfo: {
    isAddressHidden: boolean;
    address: string;
    zipCode: string; // Type for zipCode remains as string
    city: string;
    country: string;
    countryIsoCode: string;
    stateProvince: string;
    coordinates: {
      lng: number | null; // Longitude as a number
      lat: number | null; // Latitude as a number
    };
  };
  amenities: Array<{
    amenities: string[]; // Array of strings for amenities
    category: string; // Category as a string
  }>;
  sleepingArrangements: Array<{
    count: number; // Count of beds
    room: string; // Type of bed (e.g., "SleepingKingBed")
  }>;
  otherRooms: Array<{
    count: number; // Count of other rooms
    room: string; // Type of room (e.g., "RoomsBathroom")
    privacy: string; // Privacy type can be 'Private' or 'Shared'
  }>;
  currencyCode: string; // Currency code as a string literal
  hasAddons: boolean; // Indicates if there are addons
  imageUrls: string[]; // Array of image URLs as strings
  keyFacts: {
    area: number; // Area in square feet
    areaUnit: string; // Area unit as a string literal
    bathrooms: number; // Number of bathrooms
    bedrooms: number; // Number of bedrooms
    hasWifi: boolean; // Indicates if WiFi is available
    hasParking: boolean; // Indicates if parking is available
    arePetsAllowed: boolean; // Indicates if pets are allowed
    maxGuests: number; // Maximum number of guests
  };
  name: string; // Property name
  description: string; // Property description
  ownerSpokenLanguages: string[]; // Array of languages spoken by the owner
  departureHour: number; // Departure hour as a number
  arrivalHour: number; // Arrival hour as a number
  hasPromotions: boolean; // Indicates if there are promotions
  hasMultipleRoomTypesEnabled: boolean; // Indicates if multiple room types are enabled
  propertyMaxGuests: number; // Maximum guests for the property
  rooms: Array<{
    id: number; // Room ID
    name: string; // Room name
    image_url: string; // URL of the room image
    max_people: number; // Maximum occupancy
    units: number; // Number of units
    has_wifi: boolean; // Indicates if the room has Wi-Fi
    has_meal_plan: boolean; // Indicates if the room includes a meal plan
    bedrooms: number; // Number of bedrooms
    bathrooms: number; // Number of bathrooms
    area_unit: string; // Unit of area measurement (e.g., "sqf")
    area: number; // Area size of the room
    min_price: number; // Minimum price
    original_min_price: number; // Original minimum price
    max_price: number; // Maximum price
    original_max_price: number; // Original maximum price
    price_unit_in_days: number; // Number of days the price covers
    currency: {
      id: number; // Currency ID
      code: string; // Currency code (e.g., "USD")
      name: string; // Name of the currency
      euro_forex: number; // Forex rate in Euro
      symbol: string; // Currency symbol (e.g., "$")
    };
  }>;
  reviews: {
    total: number; // Total number of reviews
    averageRating: number; // Average rating
    items: Array<{
      author: string; // Author of the review
      guestType: string; // Type of guest
      rating: number; // Rating given by the guest
      reviewDate: string; // Date of the review
      stayDate: string; // Date of stay
      text: string; // Review text
      type: string;// Type of platform for the review
      title: string; // Title of the review
    }>;
  };
};


export type Room_info_in_a_property_by_id = {
  images: Array<{
    text: string;  // Image description
    url: string;   // Image URL
  }>;

  amenities: {
    room?: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    "further-info": Array<unknown>;

    cooking?: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    entertainment?: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    heating?: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    laundry?: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    livingroom?: Array<unknown>;  // Unknown type (can be replaced with specific structure if known)

    miscellaneous: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    outside: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    sanitary: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    sleeping: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;

    parking: Array<{
      name: string;  // Amenity name
      prefix: string | null;  // Optional prefix (can be null)
      bracket: string | null;  // Optional bracket (can be null)
      text: string;  // Amenity text
    }>;
  };

  description: string | null;  // Description (can be null)
  breakfast_included: boolean;  // Indicates if breakfast is included
  has_parking: boolean;  // Indicates if parking is available
  adults_only: boolean;  // Indicates if it is adults only
  pets_allowed: boolean;  // Indicates if pets are allowed
  show_additional_key_facts: boolean;  // Indicates if additional facts should be shown
  id: number;  // Unique identifier
  name: string;  // Property name
  image_url: string;  // URL of the property image
  max_people: number;  // Maximum number of people
  units: number;  // Number of units
  has_wifi: boolean;  // Indicates if WiFi is available
  has_meal_plan: boolean;  // Indicates if a meal plan is available
  bedrooms: number;  // Number of bedrooms
  bathrooms: number;  // Number of bathrooms
  area_unit: string;  // Unit of area measurement
  area: number;  // Area size
  min_price: number;  // Minimum price
  original_min_price: number;  // Original minimum price
  max_price: number;  // Maximum price
  original_max_price: number;  // Original maximum price
  price_unit_in_days: number;  // Price unit in days
  currency: {
    id: number;  // Currency ID
    code: string;  // Currency code
    name: string;  // Currency name
    euro_forex: number;  // Exchange rate to Euro
    symbol: string;  // Currency symbol
  };
};

export type lodgify_quote_beta = {
  propertyId: number;
  rentalPrice: {
    totalWithPromotions: number;
    total: number;
    nightlyPrice: number;
    nights: number;
    promotions: {
      name:string;
      value:number;
    }[];
    roomRates: {
      name: string;
      total: number;
      nightlyPrice: number;
    }[];
  };
  fees: {
    total: number;
    details: {
      name: string;
      value: number;
    }[];
  };
  localTaxes: {
    total: number;
    details: {
      name: string;
      value: number;
    }[];
  };
  totalPrice: {
    originalPrice: number;
    total: number;
    totalInPropertyCurrency: number;
    includesTaxes: boolean;
    totalExcSalesTaxes: number;
    salesTaxes: number;
    amountToPay: number;
  };
  scheduledPayments: {
    payments: {
      name: string;
      amount: number;
      isCurrent: boolean;
    }[];
    totalToCollectManually: number;
  };
  isPromotionCodeValid: boolean;
  hasPromotionCodeBeenApplied: boolean;
  idempotencyKey: string;
  currencyCode: string;
};

// GUESTY DATA FORMAT
export type guesty_listings = {
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



export type guesty_listing_details = {
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


export type guesty_quote = {
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
  coupons: any[]; // Modify based on coupon structure
  numberOfGuests: {
    numberOfAdults: number;
  };
  __v: number;
  status: string;
  promotions: object; // Modify based on the promotions structure
};

export type guesty_reservation = {
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
}



export type listings_search_client = {
  id: string;
  authorId: number;
  date: string;
  dates?: {
    unavailableDatesISO: string[]; // format: ["2025-01-04T05:00:00.000Z"]
    unavailableDates: {}[]; // format : ["2025-01-04"]
  }
  href: string;
  title: string;
  nickname: string;
  featuredImage: string;
  galleryImgs: Array<string>;
  commentCount: number;
  viewCount: number;
  like: boolean;
  address: {
    city: string;
    country: string;
    full: string;
    lat?: number;
    lng?: number;
    state: string;
    street: string;
  };
  reviewStart: number;
  reviewCount: number;
  price: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  saleOff: string;
  isAds: boolean;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    gender: string;
    avatar: string;
    count: number;
    href: string;
    desc: string;
    jobName: string;
    bgImage: string;
  };
  listingCategory?: string;
  isActive?: boolean;
  pagination?: {
    total: number,
    cursor: {
      next?: string;
    }
  }

};
interface amenitiesType {
  allAmenities: string[]


}

interface galleryImgsType {
  original: string
}
export type listing_detail_client = {
  id?: string;
  title?: string;
  galleryImgs?: Array<galleryImgsType>;
  amenities?: string[];
  max_price?: number
  min_Price?: number
  prices?: {
    lodgifyDisplayPrice?: number
    max_price: number
    basePrice: number;
    currency: string;
    monthlyPriceFactor?: number;
    weeklyPriceFactor?: number;
    extraPersonFee?: number;
    cleaningFee?: number;
    petFee?: number;
  };
  base_currency?: string

  //OPTIONAL 

  roomId?: number,
  terms?: {
    minNights?: number;
    maxNights?: number
  },
  timezone?: string;
  hostLanguages?: string[];
  publicDescription?: {

    transit?: string;
    neighborhood?: string;
    space?: string;
    access?: string;
    notes?: string;
    interactionWithGuests?: string;
    summary?: string;
    houseRules?: string;
  };
  roomType?: string;
  reviews?: {
    avg: number,
    total: number
  },
  address?: {
    isAddressHidden?: boolean;
    city?: string,
    country?: string,
    full?: string,
    lat?: number,
    lng?: number,
    state?: string,
    street?: string,
    zipCode?: string
  },

  bathrooms?: number,
  bedrooms?: number,
  beds?: number,
  accommodates?: number,
  thingsToknow?: {
    checkInTime: string,
    checkOutTime: string
    specialNote?: string
  }

  availabilities?: {

  }


};

export type listing_availabilities_client = {

}

export type listing_quote_client = {


  id?: string;
  createdAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  accountId?: string;
  guestsCount?: number;
  channel?: string;
  source?: string;
  unitTypeId?: string;
  checkInDateLocalized?: string; // Date in the format YYYY-MM-DD
  checkOutDateLocalized?: string; // Date in the format YYYY-MM-DD
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
          _id?: string;
          currency: string;
          nightlyPrice?: number;
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
  coupons: any[]; // Modify based on coupon structure
  numberOfGuests: {
    numberOfAdults: number;
  };
  __v: number;
  status: string;
  promotions: object; // Modify based on the promotions structure


}

export type Listing_Quote_Client = {
  quoteId?: string;
  createdAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  propertyId?: string;
  roomId?: string;
  currency: string;
  ratePlanId: string;

  // Date Information
  checkInDateLocalized?: string; // Date in the format YYYY-MM-DD
  checkOutDateLocalized?: string; // Date in the format YYYY-MM-DD
  lengthOfStay: number;

  // Booking Details
  guestsCount?: number;
  minNights?: number;
  maxNights?: number;
  coupons?: any[];

  // Invoice Details
  preTotal: number;
  nightlyTotal: number;
  nightlyPrice: number;
  subTotal?: number;
  stayTotal: number;

    // Promotion Information
    totalPromo?: number;
    promoItems?: {
      name: string;
      value: number;
    }[];

  // Fees Information
  totalFees?: number;
  feesItems?: {
    title: string;
    amount: number;
    type: string;
    currency?: string;
  }[];

  // Taxes Information
  totalTaxes?: number;
  taxesItems?: {
    title: string;
    amount: number | string;
    type: string;
    currency?: string;
  }[];

  // Other Charges (e.g., deposits)
  totalOtherCharges?: number;
  otherItems?: {
    title: string;
    amount: number;
    type: string;
    currency?: string;
    isCurrent?: boolean;
  }[];
};




