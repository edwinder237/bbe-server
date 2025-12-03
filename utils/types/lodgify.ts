////LODGIFY///
// ReturnType = Data returned from the API || CAMELCASE
// ObjectType = Object type returned from API e.g.; lodgifyListingDetailsObjectType || CAMELCASE
// ParamType = Data passed to the API  || CAMELCASE



///LODGIFY API REQUESTS 

//LISTINGS 
export type lodgifyListingsObjectTpye = {
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
    check_in: {
      date: string,
      for: string
    }[],
    check_out: {
      date: string,
      for: string
    }[],
    not_available: {
      date: string,
      for: string
    }[],
  },

  created_at: string;
  updated_at: string;
};
export type lodgifyListingsReturnType = {
  items: lodgifyListingsObjectTpye[];
  count?: number;
  error?: string;
  message?: string;

};
//LISTING DETAILS 
export type lodgifyListingDetailsObjectType = {
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
export type lodgifyListingDetailsReturnType = {
  item: lodgifyListingDetailsObjectType;
  error?: string;
  message?: string;
};
//LISTING DETAILS (FROM SITE API)
export type Lodgify_Listing_Details_SITE_ObjectType = {
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
  //converter
  items:   string[];
  minStay: number;
};
export type lodgifyListingCalendarReturnType = {
  items: lodgifyListingCalendarObectType[];
  error?: string;
  message?: string;
};

// LISTING ROOM INFO 
export type lodgifyListingRoomInfoObjectType = {
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
export type lodgifyListingRoomInfoReturnType = {
  item: lodgifyListingRoomInfoObjectType
  error?: string;
  message?: string;
};

//LISTING QUOTE 
export type lodgifyListingQuoteObjectType = {
  propertyId: number;
  rentalPrice: {
    totalWithPromotions: number;
    total: number;
    nightlyPrice: number;
    nights: number;
    promotions: {
      name: string;
      value: number;
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
export type lodgifyListingQuoteReturnType = {
  item: lodgifyListingQuoteObjectType
  error?: string;
  message?: string;
};
//LISTING QUOTE API
export type lodgifyListingApiQuoteObjectType = {
  total_including_vat: number | null;
  total_excluding_vat: number;
  total_vat: number;

  property_id: number;
  date_arrival: string;     // ISO datetime
  date_departure: string;   // ISO datetime

  currency_code: string;

  room_types: {
    room_type_id: number;
    name: string;
    people: number;
    price_types: {
      type: number;                // 0 = room rate, 1 = promotion, 2 = fees, 4 = taxes
      is_negative: boolean;
      description: string;
      prices: {
        uid: string;
        description: string;
        amount: number;
        fee_type: number | null;       // when type = fees
        room_rate_type: number | null; // when type = room rate
      }[];
      subtotal: number;
    }[];
    subtotal: number;
  }[];

  add_ons: any[];               // API returns empty array but could hold structured data
  other_items: any[];           // same as above
  add_ons_subtotal: number;

  rate_policy_user_id: number | null;

  scheduled_payments: {
    type: string;          // "Payment"
    date_due: string;      // "On agreement" or formatted date
    amount: number;
    is_current: boolean;
    status: string;        // "Scheduled"
  }[];

  scheduled_damage_protection: any[]; // empty array in sample

  security_deposit: number;
  total_scheduled_payments: number;
  total_to_collect_manually: number;

  amount_gross: number;

  rental_agreement: string;

  cancellation_policy_text: string;
  security_deposit_text: string;

  is_verification: boolean;
};
export type lodgifyListingApiQuoteReturnType = {
  item: lodgifyListingApiQuoteObjectType[];
  error?: string;
  message?: string;
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

export type lodgifyListingsRatesCalendarObjectType = {
  date: string | null;
  is_default: boolean;
  prices: Array<{
    min_stay: number;
    max_stay: number;
    price_per_day: number;
    price_per_additional_guest: number;
    additional_guests_starts_from: number;
  }>;
};
export type lodgifyListingsRatesCalendarReturnType = {
  calendar_items: Array<lodgifyListingsRatesCalendarObjectType>;
  error?: string;
  message?: string;

  /** Global rate settings and policies */
  rate_settings: {
    bookability: number;
    check_in_hour: number;
    check_out_hour: number;
    booking_window_days: number;
    advance_notice_days: number;
    advance_notice_hours: number;
    preparation_time_days: number;
    currency_code: string;
    vat: number;
    is_vat_exclusive: boolean;
    fees: any[];
    taxes: any[];
    promotions: any[];
  };
};