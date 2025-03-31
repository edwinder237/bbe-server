import { ListingAmenity, ListingImage } from "../types";

////HOSTAWAY///




///HOSTAWAY API REQUESTS 

//LISTINGS

export type hostaway_listings = {
  id: number;
  propertyTypeId: number;
  name: string;
  externalListingName: string | null;
  internalListingName: string | null;
  description: string;
  thumbnailUrl: string | null;
  houseRules: string | null;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  street: string;
  address: string;
  publicAddress: string;
  zipcode: string;
  price: number;
  starRating: number | null;
  personCapacity: number;
  bedroomsNumber: number | null;
  bedsNumber: number | null;
  bathroomsNumber: number | null;
  guestBathroomsNumber: number | null;
  listingAmenities: ListingAmenity[];
  listingImages: ListingImage[];
  averageReviewRating: number | null;
  lat: number;
  lng: number;




};

// LISTING DETAILS
export type hostaway_listingFeeSetting_OjectType = {
  id: number;
  accountId: number;
  listingMapId: number;
  feeType: string;
  feeTitle: string;
  feeDescription: string | null;
  feeAppliedPer: string;
  amount: number;
  amountType: string;
  isMandatory: number;
  isQuantitySelectable: number;
  appearsIn: string[];
  channelId: number;
  displayInRent: number;
  parentId: number | null;
  insertedOn: string;
  updatedOn: string;
  attachments: {
    id: number;
    accountId: number;
    listingMapId: number | null;
    reservationId: number | null;
    conversationMessageId: number | null;
    communicationId: number | null;
    taskId: number | null;
    listingFeeSettingId: number;
    guideId: number | null;
    autoTaskId: number | null;
    ownerStatementId: number | null;
    ownerStatementExpenseId: number | null;
    isInOwnerStatementExpenseData: number;
    name: string;
    url: string;
    previewUrl: string | null;
    isPublic: number;
    filesize: number;
    insertedOn: string;
    updatedOn: string;
    extension: string;
    mimeType: string;
    isImage: number;
  }[];
};
export type hostaway_listing_details_returnType = {
  id: number;
  propertyTypeId: number;
  name: string;
  externalListingName: string | null;
  internalListingName: string | null;
  description: string;
  thumbnailUrl: string | null;
  houseRules: string | null;
  country: string;
  countryCode: string | "";
  state: string;
  city: string;
  street: string;
  address: string;
  publicAddress: string;
  zipcode: string;
  price: number;
  starRating: number | null;
  personCapacity: number | 0;
  bedroomsNumber: number | 0;
  bedsNumber: number | 0;
  bathroomsNumber: number | 0;
  guestBathroomsNumber: number | 0;
  listingAmenities: ListingAmenity[];
  listingImages: ListingImage[];
  averageReviewRating: number | 0;
  lat: number;
  lng: number;
  roomType: string | "";
  timeZoneName: string | "";
  minNights: number | 0;
  maxNights: number | 0;
  checkInTimeStart: number | 16;
  checkOutTime: number | 11;
  listingFeeSetting?: hostaway_listingFeeSetting_OjectType[];
};

//REVIEWS 
export type hostaway_review_object_type = {
  id: number;
  accountId: number;
  listingMapId: number;
  reservationId: number;
  reviewerName: string;
  autoReviewId: number | null;
  timeDelta: number | null;
  scheduledDateTime: string | null;
  channelId: number;
  type: string;
  status: string;
  rating: number | null;
  externalReviewId: string;
  externalReservationId: string;
  title: string | null;
  publicReview: string | null;
  privateFeedback: string | null;
  revieweeResponse: string | null;
  revieweeResponseStatus: string | null;
  revieweeResponseUserId: number | null;
  isRevieweeRecommended: boolean | null;
  isCancelled: number;
  isHidden: number;
  submittedAt: string | null;
  insertedOn: string;
  updatedOn: string;
  autoReviewTemplateId: number | null;
  bookingEngineVisibility: number;
  reviewCategory: string[]; // Adjust type if reviewCategory has a different shape
  channelReservationId: string;
  departureDate: string;
  arrivalDate: string;
  listingName: string;
  internalListingName: string;
  externalListingName: string;
  guestName: string;

}
export type hostaway_listing_reviews_returnType = {
  status: string;
  result: hostaway_review_object_type[];
  count: number;
  offset: number;

}

export type hostawayListingsReturnType = {
  status: string;
  result: any[];
  limit?: number;
  offset?: number;
  count: number;
}
export type hostawayDetailsReturnType = {
  status: string;
  result: hostaway_listing_details_returnType;
}
export type hostawayCalendarObjecttype = {

  id: number;
  date: string;
  isAvailable: number;
  isProcessed: number;
  status: hostawayCalendarStatusType;
  price: number;
  minimumStay: number;
  maximumStay: number;
  closedOnArrival: string | null;
  closedOnDeparture: string | null;
  note: string | null;
  countAvailableUnits: number | null;
  availableUnitsToSell: number | null;
  countPendingUnits: number | null;
  countBlockingReservations: number | null;
  countBlockedUnits: number | null;
  desiredUnitsToSell: number | null;
}
type hostawayCalendarStatusType =
  | "available"
  | "blocked"
  | "mblocked"
  | "hardBlock"
  | "conflicted"
  | "reserved"
  | "pending"
  | "mreserved";

export type hostawayCalendarReturnType = {
  status: string;
  result: hostawayCalendarObjecttype[];
}

export type hostawayQuoteObjectType = {
  totalPrice: number;
  originalTotalPrice: number;
  selectedComponentsAmount: number;
  components: {
    id: null,
    listingFeeSettingId: null,
    type: string;
    name: string;
    title: string;
    alias: string | null,
    quantity: number | null,
    units: number;
    value: number;
    total: number;
    isIncludedInTotalPrice: number;
    isOverriddenByUser: number;
    isQuantitySelectable: number;
    isMandatory: boolean | null;
    isDeleted: number;
    displayInRent: number;
  },
  extraComponents: [],
  selectedComponents: []
  //SPREADED BY ACTIONS 
  lengthOfStay: number;
  checkInDateLocalized?: string; // Date in the format YYYY-MM-DD
  checkOutDateLocalized?: string; // Date in the format YYYY-MM-DD
  guestsCount?: number;
}

//QUOTE 
export type hostawayQuoteReturnType = {
  status: string;
  result: hostawayQuoteObjectType;
};

export type hostawayReservationCouponReturnType = {
  status: string;
  result?: {
    reservationCouponId: number
  };
  message?: string;
};

export type hostawayReservationOjectType = {
  id: number;
  listingMapId: number;
  listingName: string;
  channelId: number;
  source: string;
  channelName: string;
  reservationId: string;
  hostawayReservationId: string;
  channelReservationId: string;
  externalPropertyId: string | null;
  externalUnitId: string | null;
  assigneeUserId: number | null;
  customerIcalId: string | null;
  customerIcalName: string | null;
  guestAuthHash: string;
  guestPortalUrl: string;
  guestPortalRevampUrl: string | null;
  isProcessed: number;
  isInitial: number;
  isManuallyChecked: number;
  isInstantBooked: number;
  reservationDate: string;
  pendingExpireDate: string | null;
  guestName: string;
  guestFirstName: string;
  guestLastName: string;
  guestExternalAccountId: string | null;
  guestZipCode: string | null;
  guestAddress: string | null;
  guestCity: string | null;
  guestCountry: string | null;
  guestEmail: string;
  guestPicture: string | null;
  guestRecommendations: number;
  guestTrips: number;
  guestWork: string | null;
  isGuestIdentityVerified: number;
  isGuestVerifiedByEmail: number;
  isGuestVerifiedByWorkEmail: number;
  isGuestVerifiedByFacebook: number;
  originalChannel: string | null;
  isGuestVerifiedByGovernmentId: number;
  isGuestVerifiedByPhone: number;
  isGuestVerifiedByReviews: number;
  numberOfGuests: number;
  adults: number | null;
  children: number | null;
  infants: number | null;
  pets: number | null;
  arrivalDate: string;
  departureDate: string;
  isDatesUnspecified: number;
  previousArrivalDate: string | null;
  previousDepartureDate: string | null;
  checkInTime: number;
  checkOutTime: number;
  nights: number;
  phone: string;
  totalPrice: number;
  remainingBalance: number;
  taxAmount: number;
  channelCommissionAmount: number | null;
  hostawayCommissionAmount: number | null;
  cleaningFee: number;
  securityDepositFee: number;
  isPaid: number | null;
  ccName: string | null;
  ccNumber: string | null;
  ccNumberEndingDigits: string | null;
  ccExpirationYear: string | null;
  ccExpirationMonth: string | null;
  cvc: string | null;
  stripeGuestId: string;
  stripeMessage: string;
  braintreeGuestId: string | null;
  braintreeMessage: string | null;
  currency: string;
  status: string;
  paymentStatus: string;
  cancellationDate: string | null;
  cancelledBy: string | null;
  hostNote: string | null;
  guestNote: string | null;
  doorCode: string | null;
  doorCodeVendor: string | null;
  doorCodeInstruction: string | null;
  comment: string | null;
  confirmationCode: string | null;
  airbnbExpectedPayoutAmount: number | null;
  airbnbListingBasePrice: number | null;
  airbnbListingCancellationHostFee: number | null;
  airbnbListingCancellationPayout: number | null;
  airbnbListingCleaningFee: number | null;
  airbnbListingHostFee: number | null;
  airbnbListingSecurityPrice: number | null;
  airbnbOccupancyTaxAmountPaidToHost: number | null;
  airbnbTotalPaidAmount: number | null;
  airbnbTransientOccupancyTaxPaidAmount: number | null;
  airbnbCancellationPolicy: string | null;
  isStarred: number;
  isArchived: number;
  isPinned: number;
  reservationCouponId: string | null;
  customFieldValues: any[];
  reservationFees: any[];
  reservationUnit: any[];
  insertedOn: string;
  updatedOn: string;
  latestActivityOn: string;
  customerUserId: number | null;
  guestLocale: string | null;
  localeForMessaging: string | null;
  localeForMessagingSource: string | null;
  listingCustomFields: any | null;
  rentalAgreementFileUrl: string | null;
  reservationAgreement: string;
  financeField: any[];
  guestPaymentCardIsVirtual: boolean | null;
  insuranceStatus: string;
  claimStatus: string | null;
  insurancePolicyId: string | null;
  cancellationPolicyId: number;
  hostProxyEmail: string | null;
};
export type hostawayReservationReturnType = {
  status: string;
  result?: {
    reservationCouponId: number
  };
  message?: string;
};