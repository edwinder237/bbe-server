
// LOGIFY DATA FORMAT
export type lodgify_listings = {
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
  in_out: any,
  created_at: string;
  updated_at: string;
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
    basePrice: number;
    currency: string;
    monthlyPriceFactor: number;
    weeklyPriceFactor: number;
    extraPersonFee: number;
    cleaningFee: number;
    petFee: number;
  };
  publicDescription: {
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




export type listings_search_client = {
  id: string;
  authorId: number;
  date: string;
  href: string;
  listingCategoryId: number;
  title: string;
  nickname:string;
  featuredImage: string;
  galleryImgs: Array<string>;
  commentCount: number;
  viewCount: number;
  like: boolean;
  address: object;
  reviewStart: number;
  reviewCount: number;
  price: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  saleOff: string;
  isAds: boolean;
  map: {
    lat: number;
    lng: number;
  };
  author: {
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
  listingCategory: {
    id: number;
    name: string;
    href: string;
    thumbnail: string;
    count: number;
    taxonomy: string;
    listingType: string;
  };
};

export type listing_detail_client = {
  id: string;
  title: string;
  description: object;
  galleryImgs: object[];
  amenities: string[],

  //OPTIONAL 
  reviews?: {
    avg: number,
    total: number
  },
  address?: {
    city: string,
    country: string,
    full: string,
    lat: number,
    lng: number,
    state: string,
    street: string
  },
  
  bathrooms?: number,
  bedrooms?: number,
  beds?: number,
  accommodates?: number,


};