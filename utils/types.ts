////TYPES///
// ReturnType = Data returned from the API || CAMELCASE
// ObjectType = Object type returned from API e.g.; lodgifyListingDetailsObjectType || CAMELCASE
// ParamType = Data passed to the API  || CAMELCASE
// OBJECT = ITEM OBJECT passed to FRONT END
// RETURN = FORMAT passed to FRONT END


// TOP LEVEL 

export type integrationTypes = "lodgify" | "guesty" | "hostaway";
export type internal_ID = string;
export type token = string;
export type action = string;


interface PaginatedResponse {
  total: number;
  cursor: {
    next: string;
  };
}

// Listing amenities
export interface ListingAmenity {
  id: number;
  amenityId: number;
  amenityName: string;
}

// Images
export interface ListingImage {
  id: number;
  caption: string;
  bookingEngineCaption: string | null;
  airbnbCaption: string | null;
  vrboCaption: string | null;
  url: string;
  sortOrder: number;
};
export type amenitiesType = Array<string>

interface galleryImgsType {
  original: string
};
export type GalleryImages = Array<galleryImgsType>;

/// ----------------- AUTH FORMATS ---------------------------
export type getAuthParams = {
  internal_ID: internal_ID
  needNewToken: boolean
  integrationType: integrationTypes

};
export type lodgifyAuthParams = {
  appKey: string;
  apiKey: string;
};

/// ----------------- CLIENT FORMATS ---------------------------

//LISTINGS 
export type CLIENT_LISTINGS_OBJECT = {
  id: string;
  authorId?: number;
  date?: string;
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
  saleOff?: string;
  isAds?: boolean;
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
  lodgifySiteApi?: {
    max_people: number | null;
  } | null
  wixCmsApi?: {} | null;
};
export type CLIENT_LISTINGS_RETURN = {
  total: number;
  items: CLIENT_LISTINGS_OBJECT[];
  locations?: Array<{
    city: string;
    state: string;
    country: string;
  }>;
  pagination?: PaginatedResponse

  error?: string;
  message?: string
};
//LISTING DETAILS 
export type CLIENT_LISTING_DETAILS_OBJECT = {
  id?: string;
  title?: string;
  galleryImgs?: GalleryImages;
  amenities?: amenitiesType;
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
  };
  bathrooms?: number;
  bedrooms?: number;
  beds?: number;
  accommodates?: number;
  thingsToknow?: {
    checkInTime: string,
    checkOutTime: string
    specialNote?: string
  };

  reviews?: CLIENT_LISTING_REVIEWS_RETURN;
  ///ADDED WITH ACTION FUNCTION - getListingDetails();
  calendar?: CLIENT_LISTING_CALENDAR_RETURN;
  addons?: CLIENT_LISTING_ADDONS_RETURN;
  wixCms?: any;
  //LODGIFY ONLY 
  roomId?: string;
};
export type CLIENT_LISTING_DETAILS_RETURN = { // pass conditional lodgify site and wix and roomInfo to item 
  item: CLIENT_LISTING_DETAILS_OBJECT;
  error?: string;
  message?: string

};


// LISTING QUOTE
export type CLIENT_LISTING_QUOTE_OBJECT = {
  quoteId?: string;
  createdAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  propertyId?: string;
  roomId?: string;
  currency: string;
  ratePlanId: string;




  // Booking Details

  minNights?: number;
  maxNights?: number;
  coupons?: any[];
  couponCode?: string;


  // Invoice Details
  preTotal: number;
  nightlyTotal: number;
  nightlyPrice: number;
  subTotal?: number;
  stayTotal: number;

  // Promotion or Coupons Information
  totalPromo?: number;
  promoItems?: {
    name: string;
    value: number;
    type?: string | "PERCENT";
  }[];


  // Fees Information
  totalFees?: number;
  feesItems?: {
    title: string;
    amount: number;
    type: string;
    currency?: string;
  }[];
  // Addons Information
  totalAddons?: number;
  addonsItems?: {
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
  ///SPREADED with ACTION
  lengthOfStay: number;  // SPREAD BY ACTION  
  checkInDateLocalized?: string; // Date in the format YYYY-MM-DD
  checkOutDateLocalized?: string; // Date in the format YYYY-MM-DD
  guestsCount?: number;
};
export type CLIENT_LISTING_QUOTE_RETURN = {
  item: CLIENT_LISTING_QUOTE_OBJECT;
  error?: string;
  message?: string;
};
// LISTING CALANDAR
export type CLIENT_LISTING_CALENDAR_OBJECT = {
};
export type CLIENT_LISTING_CALENDAR_RETURN = {
  items: Date[] | string[]; // format: ["2025-01-04
  error?: string;
  message?: string;
};
//LISTING REVIEWS
export type CLIENT_LISTING_REVIEWS_OBJECT = {
  id: string | "";
  reviewText: string | undefined
  createdDateTime: string;
  expireAt: string | boolean
  ratingScore: string
  channelId?: number;

};
export type CLIENT_LISTING_REVIEWS_RETURN = {
  total: number | 0;
  avg?: number;
  items: CLIENT_LISTING_REVIEWS_OBJECT[];

};

export type CLIENT_LISTING_ADDONS_OBJECT = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  feeAppliedPer: string | null;
  amount: number;
  amountType: string | null;
  isMandatory: number;
  img?: string | null;
  isQuantitySelectable: number;
  //for front end
  quantity?: number | null;
  selected?: boolean;



};
export type CLIENT_LISTING_ADDONS_RETURN = {
  items: CLIENT_LISTING_ADDONS_OBJECT[];
  total: number;
};

// RESERVATION (to be completed)
export type CLIENT_LISTING_RESERVATION_OBJECT = {
  quoteId?: string;
};
export type CLIENT_LISTING_RESERVATION_RETURN = {
  item: Array<any>;
  error?: string;
  message?: string;
};

// PAYMENT (to be completed)
export type CLIENT_LISTING_PAYMENT_OBJECT = {
  quoteId?: string;
};
export type CLIENT_LISTING_PAYMENT_RETURN = {
  item: object;
  error?: string;
  message?: string;
};

export type CLIENT_LISTINGS_LOCATIONS_OBJECT = {
  city: string;
  state: string;
  country: string;
};

export type CLIENT_LISTINGS_LOCATIONS_RETURN = {
  items: CLIENT_LISTINGS_LOCATIONS_OBJECT[];
  total: number;
};

export type CLIENT_LISTINGS_RATESCALENDAR_OBJECT = {
  dates: {
    date: string; // yyyy-mm-dd
    price: number;
  }[]

  currency: string;
};
export type CLIENT_LISTINGS_RATESCALENDAR_RETURN = {
  items: CLIENT_LISTINGS_RATESCALENDAR_OBJECT[];
};




// FETCHERS PROP TYPES

export type FetchResponse = {
  success: boolean;
  data: any;
  message?: string;
}
export type FetchingHelperParams = {
  endpointUrl: string;
  action: action;
  token?: token;
  lodgifyAuth?: lodgifyAuthParams;
};
export type handleFetchParams = {
  fetchUrl: string
  options: RequestInit
  action: action
};

export type Params = {
  offset?: number;
  limit?: number;
  pageNum?: number;
  listingId?: string;
  currency?: string;
  default_Lang?: string;
  websiteId?: string
  roomId?: string;
  lodgifySite?: {
    url: string;
    id: string;
  };
  nextPage?: string;
  availabilities?: {
    fromDate: string;
    toDate: string;
  };
  search?: {
    guestsCount?: number;
    checkInDateLocalized: string;
    checkOutDateLocalized: string;
    location?: {
      city: string;
      state?: string;
      country?: string;
    }
  };
  quote?: {
    guestsCount: number;
    checkInDateLocalized: string;
    checkOutDateLocalized: string;
    currency: string;
    coupons?: string;
    couponId?: number;
    addons?: CLIENT_LISTING_ADDONS_OBJECT[];
  };
  reservation?: {
    quoteId?: string;
    ratePlanID?: string;
    ccToken?: string;
    guest: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      specialRequest?: string;
    };
    dates?: {
      checkInDateLocalized: string;
      checkOutDateLocalized: string;
    };
    cc?: {
      ccNumber: string;
      ccName: string;
      ccExpirationYear: string;
      ccExpirationMonth: string;
      cvc: string;
    };
    totalPrice?: number;
    financeField?: Array<any>;

  };
  lodgifyParams?: {
    roomId: number;
  };
};



// ACTION PROP TYPES
interface wix_paramsType {
  wix_req: string;
  siteURL?: string;
  listingId?: number;
}

export interface actionsParams {
  internal_ID: string;
  params?: Params;
  wix_params?: wix_paramsType;
  auth?: lodgifyAuthParams;


  keysObject?: any
  RoomId?: number
};
export type ApiFetcherParams = {
  token?: string; // Guesty or Hostaway
  default_Lang: string | "en";
  listingId?: string;
  internal_ID?: string;
  params?: Params;
  wix_params?: wix_paramsType;
  auth?: lodgifyAuthParams;
  keysObject?: any
  RoomId?: number
  queryParams?: URLSearchParams

};

export interface GlobalFetcherReturnType {
  success: boolean;
  data: any;
  message?: string;
  error?: string; 
}

// 2. Define the return type if desired
export interface ActionReturn {
  success: boolean;
  data?: any;
  message?: string;
}

// 3. Create a type for your 'actions' object
export type ActionsMap = {
  [key: string]: (args: actionsParams) => Promise<any>;
};
export type FetchMap = {
  [key: string]: (args: ApiFetcherParams) => Promise<any>;
}

