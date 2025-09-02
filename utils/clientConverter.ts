import { parseISO, formatISO, addDays } from 'date-fns';
import {

  CLIENT_LISTINGS_OBJECT,
  CLIENT_LISTING_DETAILS_OBJECT,
  CLIENT_LISTING_QUOTE_OBJECT,
  GalleryImages,
  amenitiesType,
  CLIENT_LISTING_REVIEWS_RETURN,
  CLIENT_LISTING_CALENDAR_RETURN,
  CLIENT_LISTING_ADDONS_OBJECT,
  CLIENT_LISTINGS_RATESCALENDAR_OBJECT,

} from "./types";
import {
  lodgifyListingsObjectTpye,
  lodgifyListingDetailsObjectType,
  lodgifyListingRoomInfoObjectType,
  lodgifyListingQuoteObjectType,
  Lodgify_Listing_Details_SITE_ObjectType,
  lodgifyListingCalendarObectType,
  lodgifyListingCalendarReturnType,
  lodgifyListingsRatesCalendarReturnType,

} from './types/lodgify';

import {
  guestyListingsObjectType,
  guestylistingDetailsObjectType,
  guestyListingQuoteObjectType,
  guestyListingReviewsObjectType,
  guestyListingReviewsReturnType,
  guestyListingCalendarReturnType


} from './types/guesty';



import {
  hostaway_listings,
  hostawayCalendarObjecttype, hostawayCalendarReturnType, hostawayQuoteObjectType, hostawayQuoteReturnType,
  hostaway_review_object_type, hostaway_listing_reviews_returnType, hostaway_listing_details_returnType,
  hostaway_listingFeeSetting_OjectType,


} from './types/hostaway';
// Create a class to handle the conversion - DESCRIPTION MUST BE IN SNAKE_CASE FORMAT 

/// LODGIFY ///
export class lodgify_listings_converter {
  private input: lodgifyListingsObjectTpye;

  constructor(input: lodgifyListingsObjectTpye) {
    this.input = input;
  }

  // CONVERTS INPUT TO CLIENT REQUIEREMENT
  public convert(): CLIENT_LISTINGS_OBJECT {
    return {
      id: this.IdToString(),
      authorId: 10, // Static value, you can adjust this as needed
      date: new Date(this.input.created_at).toLocaleDateString(),
      isActive: this.input.is_active,
      href: "/listing-guesty", // Static value, you can adjust this
      title: this.input.name,
      nickname: "",
      featuredImage: this.input.image_url,
      galleryImgs: this.getGalleryImages(),
      commentCount: 0,
      viewCount: 0,
      like: false,
      address: {
        full: this.input.address,
        city: this.input.city,
        country: this.input.country,
        lat: this.input.latitude,
        lng: this.input.longitude,
        state: this.input.state,
        street: this.input.zip

      },
      reviewStart: this.input.rating,
      reviewCount: this.getReviewCount(),
      price: this.formatPrice(),
      maxGuests: 0,
      bedrooms: 0,
      bathrooms: 0,
      saleOff: "", // Assuming no sale info, adjust if available
      isAds: false, // Assuming no ad flag, adjust if available
      dates: {
        unavailableDatesISO: this.convertDatesToISO8601(this.input.in_out.not_available),
        unavailableDates: this.input.in_out.not_available

      }
    };
  }

  // helper method to convert dates to iso format 
  private convertDatesToISO8601(notAvailable: { date: string; for: string }[]): string[] {

    const isoNotAvailable = notAvailable.map((item) => `${item.date}T00:00:00.000Z`);
    return isoNotAvailable
  }


  // Helper method to convert ID to string
  private IdToString(): string {
    return `${this.input.id}`;
  }

  // Helper method to format price as a string
  private formatPrice(): string {
    return `${this.input.original_min_price.toFixed(2)} ${this.input.currency_code}`;
  }

  // Helper method to calculate max guests (assuming 2 guests per room)
  private calculateMaxGuests(): number {
    return this.input.rooms.length * 2;
  }

  // Helper method to return gallery images
  private getGalleryImages(): string[] {
    // Returning same image for simplicity; update with real logic if necessary
    return this.input.rooms.map(() => this.input.image_url);
  }

  // Placeholder method for review count
  private getReviewCount(): number {
    // Assuming no review count info available, returning 0.
    return 0;
  }
};
export class lodgify_listing_details_converter {
  private input: lodgifyListingDetailsObjectType;

  constructor(input: lodgifyListingDetailsObjectType) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): CLIENT_LISTING_DETAILS_OBJECT {
    return {
      id: this.input.id.toString(),
      roomId: this.input.rooms[0]?.id.toString(),
      title: this.input.name,
      base_currency: this.input.currency.code,
      bathrooms: this.input.rooms[0]?.bathrooms,
      bedrooms: this.input.rooms[0]?.bedrooms,
      accommodates: this.input.rooms[0]?.max_people,
      prices: {
        lodgifyDisplayPrice: this.input.original_min_price,
        max_price: this.input.max_price,
        basePrice: this.input.min_price,
        currency: this.input.currency.code

      }
    };
  }



};

export class lodgify_listing_roomInfo_converter {
  private input: lodgifyListingRoomInfoObjectType;

  constructor(input: lodgifyListingRoomInfoObjectType) {
    this.input = input;
  }

  // Method to convert input to front-end format
  public convert(): CLIENT_LISTING_DETAILS_OBJECT {
    return {
      galleryImgs: this.convertIMGs(this.input.images),
      amenities: this.getAmenities(this.input.amenities, this.input.id),
      publicDescription: {
        summary: this.input.description ?? "",
      },

    };
  }

  // Helper method to convert images array to client format => [{original:"imgurl"}]
  private convertIMGs(imgsArray: { url: string }[]): { original: string }[] {
    return imgsArray.map((img) => ({
      original: `https:${img.url}`,
    }));
  }

  private getAmenities(amenitiesArray: Record<string, { text: string }[] | unknown[]>, propertyId: number): string[] {
    const allAmenities: string[] = [];

    // If it's NOT the property that needs special French grammar handling,
    // we skip all the parsing logic and just push amenity.text as-is
    const needsFrenchGrammarFix = propertyId === 560514;

    // Loop through each "category" in amenitiesArray
    Object.values(amenitiesArray).forEach((category) => {
      // Only process categories that look like { text: string }[]
      if (!Array.isArray(category)) return;
      if (!category.every(item => item && typeof item === 'object' && 'text' in item)) return;

      // Process each amenity in this category
      (category as { text: string }[]).forEach((amenity) => {
        const text = amenity.text?.trim();
        if (!text) {
          // Skip empty or undefined texts
          return;
        }

        // If we do NOT need French grammar fixes for this property, just push the raw text
        if (!needsFrenchGrammarFix) {
          allAmenities.push(text);
          return;
        }

        // Otherwise, transform the text for French grammar
        allAmenities.push(this.transformAmenityText(text));
      });
    });

    return allAmenities;
  }

  /**
   * Transform amenity text according to the special French grammar rules,
   * preserving any leading number if present.
   */
  private transformAmenityText(originalText: string): string {
    // 1) Check if the text starts with a number, e.g. "2 Salle de bain"
    const match = originalText.match(/^(\d+)/);
    const count = match ? parseInt(match[1], 10) : null;

    // 2) Trim off the leading number for matching the actual words
    //    e.g. "2 Salle de bain" -> "Salle de bain"
    const textWithoutNumber = count !== null
      ? originalText.slice(match![0].length).trim()
      : originalText;

    // 3) Decide how to transform based on known rules.
    //    We can do this either via a series of if/else or switch(true).
    //    For readability, here’s a set of if/else checks:

    // --- "Salle de bain" ---
    if (textWithoutNumber.includes("Salle de bain")) {
      return this.buildAmenityString(count, "Salle de bain", "Salles de bains");
    }

    // --- "Chambre" ---
    if (textWithoutNumber.includes("Chambre")) {
      return this.buildAmenityString(count, "Chambre", "Chambres");
    }

    // --- "Salle à manger" ---
    if (textWithoutNumber.includes("Salle à manger")) {
      return this.buildAmenityString(count, "Salle à manger", "Salles à manger");
    }

    // --- "Salle de séjour" ---
    if (textWithoutNumber.includes("Salle de séjour")) {
      return this.buildAmenityString(count, "Salle de séjour", "Salles de séjour");
    }

    // --- "Lit extra-large" => "Lit King" ---
    if (textWithoutNumber.includes("Lit extra-large")) {
      return this.buildAmenityString(count, "Lit King", "Lits King");
    }

    // --- "Lit grand deux places" => "Lit Queen" ---
    if (textWithoutNumber.includes("Lit grand deux places")) {
      return this.buildAmenityString(count, "Lit Queen", "Lits Queen");
    }

    // --- "Haut débit Internet" => "Internet Haute Vitesse" ---
    if (textWithoutNumber.includes("Haut débit Internet")) {
      return this.buildAmenityString(count, "Internet Haute Vitesse", "Internet Haute Vitesse");
    }

    // --- "Wi-fi haut débit Internet" => "Wi-Fi" ---
    if (textWithoutNumber.includes("Wi-fi haut débit Internet")) {
      return this.buildAmenityString(count, "Wi-Fi", "Wi-Fi");
    }

    // --- "Poêle à bois ou en faïence" => "Poêle à bois" ---
    if (textWithoutNumber.includes("Poêle à bois ou en faïence")) {
      return this.buildAmenityString(count, "Poêle à bois", "Poêles à bois");
    }

    // If no special rules matched, return the original text
    return originalText;
  }

  /**
   * Helper to build final amenity string given:
   * - count (could be null if no leading number)
   * - singular form
   * - plural form
   */
  private buildAmenityString(count: number | null, singular: string, plural: string): string {
    if (count === null) {
      // No leading number => just return singular (or whatever you prefer)
      return singular;
    }

    // If there's a number, decide singular vs plural
    if (count > 1) {
      return `${count} ${plural}`;
    }
    return `${count} ${singular}`;
  }
};
export class client_lodgiy_listing_info_Converter {
  private input: lodgifyListingRoomInfoObjectType;

  constructor(input: lodgifyListingRoomInfoObjectType) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): CLIENT_LISTING_DETAILS_OBJECT {
    return {
      galleryImgs: this.input.images.map(img => ({ original: `https:${img.url}` })),
      prices: {
        max_price: this.input.original_max_price || 0,
        basePrice: this.input.original_min_price || 0,
        currency: this.input.currency.code
      },
      bedrooms: this.input.bedrooms,
      bathrooms: this.input.bathrooms,
      accommodates: this.input.max_people,
      amenities: this.amenitiesConvert()
    };
  }
  // Helper amenities to Array of strings
  private amenitiesConvert(): Array<string> {
    const amenitiesList = this.input.amenities;
    const flatAmenities: string[] = []; // Changed name to flatAmenities for clarity

    // Loop through each type of amenities
    for (const category in amenitiesList) {
      if (Array.isArray(amenitiesList[category])) {
        amenitiesList[category].forEach((item) => {
          // Push the text property of each item to the flatAmenities array
          if (item.text) {
            flatAmenities.push(item.text);
          }
        });
      }
    }

    return flatAmenities;
  }


};

export class lodgify_listing_details_SITE_converter {
  private input: Lodgify_Listing_Details_SITE_ObjectType;

  constructor(input: Lodgify_Listing_Details_SITE_ObjectType) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): CLIENT_LISTING_DETAILS_OBJECT {
    return {
      hostLanguages: this.input.ownerSpokenLanguages ?? [],
      publicDescription: {
        transit: "",
        neighborhood: "",
        space: "",
        access: "",
        notes: "",
        interactionWithGuests: "",
        //summary: this.input?.description ?? "", this is now fetching from the room info API to assure transaltions
        houseRules: "",
      },
      beds: this.input?.sleepingArrangements?.length ?? 0,

      reviews: {
        avg: this.input?.reviews?.averageRating ?? 0,
        total: this.input?.reviews?.total ?? 0,
        items: []
      },

      //roomId: this.input?.rooms?.[0]?.id.toString() ?? "999", // Default to 999 if roomId is undefined

      address: {
        isAddressHidden: this.input?.addressInfo?.isAddressHidden ?? false,
        city: this.input?.addressInfo?.city ?? "",
        country: this.input?.addressInfo?.country ?? "",
        full: this.input?.addressInfo?.address ?? "",
        lat: this.input?.addressInfo?.coordinates?.lat ?? 0,
        lng: this.input?.addressInfo?.coordinates?.lng ?? 0,
        state: this.input?.addressInfo?.stateProvince ?? "",
        street: "not available",
        zipCode: this.input?.addressInfo?.zipCode ?? "",
      },
      thingsToknow: {
        checkInTime: this.convertToTimeString(this.input.arrivalHour),
        checkOutTime: this.convertToTimeString(this.input.departureHour),
      }
    };
  }
  private convertToTimeString(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  }

};
export class lodgify_listing_calendar_converter {
  private input: lodgifyListingCalendarObectType[];
  private disabledDates: lodgifyListingCalendarObectType[];

  constructor(input: lodgifyListingCalendarObectType[]) {
    this.input = input;
    //return only disabledDates Dates
    this.disabledDates = this.input.filter((date: lodgifyListingCalendarObectType) => date.is_available !== true);
  }

  // Convert the entire Hostaway reviews response into client format.
  public convert(): CLIENT_LISTING_CALENDAR_RETURN {

    return {
      items: this.disabledDates.flatMap((date: lodgifyListingCalendarObectType) => this.getDatesInRange(date)),
    };
  }

  // Helper function to get all dates within a range for Lodgify
  private getDatesInRange = (data: lodgifyListingCalendarObectType): Date[] => {

    const { period_start, period_end } = data;
    if (!period_start || !period_end) {
      console.warn("Invalid period range data:", data);
      return [];
    }

    const dates: Date[] = [];
    //let currentDate = addDays(parseISO(period_start), 1);
    let currentDate = parseISO(period_start);
    const endDate = parseISO(period_end);

    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  };

};
export class lodgify_listings_rateCalendar_converter {
  private input: lodgifyListingsRatesCalendarReturnType;

  constructor(input: lodgifyListingsRatesCalendarReturnType) {
    this.input = input;
  }

  // Method to convert input to front-end format
  public convert(): CLIENT_LISTINGS_RATESCALENDAR_OBJECT {
    const dates = this.input.calendar_items
      .filter((item) => item.date !== null)
      .map((item) => ({
        date: item.date!,                    // we know it’s not null here
        price: item.prices[0].price_per_day, // pick the first tier’s price
      }));

    return {
      currency: this.input.rate_settings.currency_code || "USD",
      dates: dates,
    };
  }





};

export class lodgify_listing_quote_converter {
  private input: lodgifyListingQuoteObjectType;

  constructor(input: lodgifyListingQuoteObjectType) {
    this.input = input;
  }

  // Method to convert input to Listing_Quote_Client format
  public convert(): CLIENT_LISTING_QUOTE_OBJECT {

    return {
      propertyId: this.input.propertyId?.toString(),
      currency: this.input.currencyCode,
      ratePlanId: "",

      // Date Information
      lengthOfStay: this.input?.rentalPrice?.nights,

      // Invoice Details
      preTotal: this.input.totalPrice.totalExcSalesTaxes,
      nightlyTotal: this.input.rentalPrice.total,
      nightlyPrice: this.input.rentalPrice.nightlyPrice,
      subTotal: (this.input.rentalPrice.total ?? 0) + (this.input.fees?.total ?? 0) || this.input?.totalPrice?.total || 0,
      stayTotal: this.input.totalPrice.total,

      // Promo Information
      totalPromo: this.input.rentalPrice.promotions.reduce((sum, promotion) => sum + promotion.value, 0),
      promoItems: this.convertPromos(this.input.rentalPrice.promotions),

      // Fees Information
      totalFees: (this.input.fees?.total ?? 0),
      feesItems: this.convertInvoiceItems(this.input.fees.details, this.input.currencyCode, "fee"),

      // Taxes Information
      totalTaxes: this.calculateTotalTaxes({ totalPrice: this.input.totalPrice, localTaxes: this.input.localTaxes }),
      taxesItems: this.getSalesTaxes(this.input.totalPrice.salesTaxes, this.input.currencyCode, this.input.localTaxes.details),

      // Taxes Information
      otherItems: this.convertPaymentsItems(this.input.scheduledPayments.payments, this.input.currencyCode, "deposit"),
    };
  }

  private calculateTotalTaxes(input) {
    const { totalPrice, localTaxes } = input;

    // Ensure defaults for safety
    const localTaxesTotal = localTaxes?.total || 0;
    const salesTaxes = totalPrice?.salesTaxes || 0;

    return totalPrice?.includesTaxes
      ? localTaxesTotal // Only local taxes if taxes are included
      : localTaxesTotal + salesTaxes; // Add sales taxes if not included
  }

  private getSalesTaxes(
    taxAmount: number,
    currency: string,
    taxes: { name: string; value: number }[]
  ) {
    return [
      ...(taxAmount > 0
        ? [
          {
            title: "Sales Tax",
            amount: taxAmount,
            type: "tax",
            currency,
          },
        ]
        : []),
      ...taxes.map((tax) => ({
        title: tax.name,
        amount: tax.value,
        type: "tax",
        currency,
      })),
    ];
  }

  private convertPromos(promotions: { name: string; value: number; }[]) {
    return promotions.map((promotion) => ({
      name: promotion.name || "Unknown",
      value: promotion?.value
    }))

  }


  // Helper method to convert Invoice items
  private convertInvoiceItems(
    fees: { name: string; value: number }[],
    currency: string,
    type: string
  ) {
    const Fees = fees.map((detail) => ({
      title: detail.name,
      amount: detail.value,
      type: type,
      currency,
    }));



    return [...Fees];
  }

  // Helper method to convert payments items
  private convertPaymentsItems(payments: { name: string; amount: number; isCurrent?: boolean; }[], currency: string, type: string) {
    return payments.map((payment) => ({
      title: payment.name,
      amount: payment.amount,
      type: type,
      currency,
      isCurrent: payment?.isCurrent
    }));
  }
};
/// GUESTY ///
export class guesty_listings_converter {
  private input: guestyListingsObjectType;

  constructor(input: guestyListingsObjectType) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): CLIENT_LISTINGS_OBJECT {
    return {
      id: this.IdToString(),
      listingCategory: this.input.propertyType,
      authorId: 10, // Static value, you can adjust this as needed
      date: new Date().toLocaleDateString(), // Use the current date or adjust based on your logic
      href: "/listings",
      title: this.input.title,
      nickname: this.input.nickname,
      featuredImage: this.input.picture.thumbnail, // Use the thumbnail as the featured image
      galleryImgs: this.getGalleryImages(),
      commentCount: 0, // Assuming no comment data available, you can adjust
      viewCount: 0, // Assuming no view count data available, you can adjust
      like: false, // Assuming no like info available, you can adjust
      address: this.input.address, // Use the full address
      reviewStart: this.input.reviews.avg,
      reviewCount: this.getReviewCount(),
      price: this.formatPrice(),
      maxGuests: this.input.accommodates,
      bedrooms: this.input.bedrooms,
      bathrooms: this.input.bathrooms,
      saleOff: "", // Assuming no sale info, adjust if available
      isAds: false, // Assuming no ad flag, adjust if available
      author: {
        id: 10,
        firstName: "",
        lastName: "",
        displayName: "",
        email: "", // Static value, adjust based on your logic
        gender: "", // Static value, adjust based on your logic
        avatar: "", // Placeholder
        count: 111, // Static value, adjust based on your logic
        href: "/author", // Static value
        desc: "", // Placeholder
        jobName: "", // Placeholder
        bgImage:
          "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      },
    };
  }

  // Helper method to convert ID to string
  private IdToString(): string {
    return this.input._id; // Use _id from guesty_listings
  }

  // Helper method to format price as a string
  private formatPrice(): string {
    return `${this.input.prices.basePrice.toFixed(2)} ${this.input.prices.currency
      }`; // Adjusted for guesty_listings
  }

  // Helper method to return gallery images
  private getGalleryImages(): string[] {
    return this.input.pictures.map((picture) => picture.original); // Use original images from guesty_listings
  }

  // Placeholder method for review count
  private getReviewCount(): number {
    return this.input.reviews.total; // Use the total reviews from guesty_listings
  }
};
export class guesty_listing_detail_Converter {
  private input: guestylistingDetailsObjectType;

  constructor(input: guestylistingDetailsObjectType) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): CLIENT_LISTING_DETAILS_OBJECT {
    return {
      id: this.input._id,
      title: this.input.title,
      roomType: this.input.roomType,
      galleryImgs: this.input.pictures,
      reviews: {
        avg: this.input.reviews.avg,
        total: this.input.reviews.total,
        items: []
      },
      address: {
        city: this.input.address.city,
        country: this.input.address.country,
        full: this.input.address.full,
        lat: this.input.address.lat,
        lng: this.input.address.lng,
        state: this.input.address.state,
        street: this.input.address.street,
      },
      terms: {
        minNights: this.input.terms.minNights,
        maxNights: this.input.terms.maxNights
      },
      timezone: this.input.timezone,
      prices: this.input.prices,
      bathrooms: this.input.bathrooms,
      bedrooms: this.input.bedrooms,
      beds: this.input.beds,
      accommodates: this.input.accommodates,
      amenities: this.input.amenities
      ,
      publicDescription: {
        transit: this.input.publicDescription?.transit,
        neighborhood: this.input.publicDescription?.neighborhood,
        space: this.input.publicDescription?.space,
        access: this.input.publicDescription?.access,
        notes: this.input.publicDescription?.notes,
        interactionWithGuests: this.input.publicDescription?.interactionWithGuests,
        summary: this.input.publicDescription?.summary,
        houseRules: this.input.publicDescription?.houseRules
      },
      thingsToknow: {
        checkInTime: this.input?.defaultCheckInTime,
        checkOutTime: this.input?.defaultCheckOutTime,
        houseRules: this.input?.publicDescription?.houseRules,
        specialNote: this.input?.publicDescription.notes,
        summary:this.input?.publicDescription?.summary
      }
    };
  }
};
export class guesty_listing_reviews_converter {
  private input: guestyListingReviewsReturnType;

  constructor(input: guestyListingReviewsReturnType) {
    this.input = input;
  }

  // Convert the entire Guesty reviews response into client format.
  public convert(): CLIENT_LISTING_REVIEWS_RETURN {
    return {
      total: this.input.data.length,
      items: this.input.data.map((review: guestyListingReviewsObjectType) => ({
        id: review._id,
        reviewText: review.rawReview.public_review || review.rawReview?.title?.value,
        createdDateTime: review.rawReview.createdDateTime || review.rawReview.submitted_at,
        expireAt: review.rawReview.expires_at || false,
        ratingScore: review.rawReview.starRatingOverall || review.rawReview.overall_rating?.toString() || review.rawReview.scoring?.review_score.toString() || "0"

      })),
    };
  }
};
export class guesty_listing_quote_Converter {
  private input: guestyListingQuoteObjectType;

  constructor(input: guestyListingQuoteObjectType) {
    this.input = input;
  }

  // Method to convert input to Listing_Quote_Client format
  public convert(): CLIENT_LISTING_QUOTE_OBJECT {
    const quote = this.input.rates?.ratePlans[0].ratePlan?.money;
    const quoteParams = this.input.rates?.ratePlans[0];
    const coupon = this.input.coupons.length && [{
      name: this.input.coupons[0]?.name,
      value: this.input.coupons[0]?.discount || 0,
      type: this.input.coupons[0]?.discountType || "",
      currency: quote.currency}]
    const totalCoupon = this.input.coupons[0]?.discount || 0;
    return {
      quoteId: this.input._id,
      createdAt: this.input.createdAt,
      expiresAt: this.input.expiresAt,
      propertyId: this.input.createdAt,
      currency: quote.currency,
      ratePlanId: this.input.rates.ratePlans[0].ratePlan._id,

      // Date Information
      checkInDateLocalized: this.input.checkInDateLocalized,
      checkOutDateLocalized: this.input.checkOutDateLocalized,
      lengthOfStay: quoteParams.days.length,

      // Booking Details
      guestsCount: this.input.guestsCount,
      minNights: quoteParams.ratePlan.minNights,
      coupons: this.input.coupons,

      // Invoice Details
      preTotal: quote.fareAccommodation,
      nightlyTotal: quote.fareAccommodation,
      nightlyPrice: this.getNightlyCost(quote.fareAccommodation, quoteParams.days.length),
      subTotal: quote.subTotalPrice,
      stayTotal: quote.hostPayout,

      // Fees Information
      totalFees: quote.totalFees,
      feesItems: this.convertInvoiceItems(quote.invoiceItems, "fee"),

      // Taxes Information
      totalTaxes: quote.totalTaxes,
      taxesItems: this.convertInvoiceItems(quote.invoiceItems, "tax"),

      // Promoo Information
      totalPromo: totalCoupon,
      promoItems: coupon,

    }
  }
  //helper method that gets nightly cost for a quote
  private getNightlyCost(basePrice: number, stayLength: number): number {
    if (typeof basePrice !== 'number' || basePrice <= 0) {
      throw new Error('Invalid base price provided');
    }

    if (typeof stayLength !== 'number' || stayLength <= 0) {
      throw new Error('Invalid stay length provided');
    }

    return basePrice / stayLength;
  }
  

  // Helper method to convert Invoice items
  private convertInvoiceItems(
    details: { title: string; amount: number; currency: string; type: string; normalType: string }[],
    type: string
  ) {
    const taxes_codes = new Set([
      "LOCAL_TAX",
      "CITY_TAX",
      "VAT",
      "GOODS_AND_SERVICES_TAX",
      "TOURISM_TAX",
      "OTHER",
      "TAX"
    ]);

    // Filter out items with type "ACCOMMODATION_FARE" and then filter based on the input type
    return details
      .filter((detail) => detail.type !== "ACCOMMODATION_FARE")
      .filter((detail) => detail.type !== "DISCOUNT")
      .filter((detail) =>
        type === "tax"
          ? taxes_codes.has(detail.type) // Check for tax types using `Set` for better performance
          : !taxes_codes.has(detail.type) // Check for non-tax (fee) types
      )
      .map((detail) => ({
        title: detail.title.replace(/_/g, " "), // Replace underscores with spaces
        amount: detail.amount,
        type, // Set type based on the input parameter
        currency: detail.currency,
      }));
  }

  // Helper method to convert payments items
  private convertPaymentsItems(payments: { name: string; amount: number; isCurrent?: boolean; }[], currency: string, type: string) {
    return payments.map((payment) => ({
      title: payment.name,
      amount: payment.amount,
      type: type,
      currency,
      isCurrent: payment?.isCurrent
    }));
  }

}
export class guesty_listing_calendar_converter {
  private disabledDates: guestyListingCalendarReturnType;

  constructor(private input: guestyListingCalendarReturnType) {
    // Keep only non-available ("disabled") dates
    this.disabledDates = this.input.filter(
      (date) => date.status !== "available"
    );
  }

  public convert(): CLIENT_LISTING_CALENDAR_RETURN {
    // Convert each disabled date string into a Date object
    const originalDates: Date[] = this.disabledDates.map((d) =>
      parseISO(d.date)
    );
    // Remove the first date of each consecutive block (optimized single pass)
    const processedDates = this.removeFirstDayOfConsecutiveBlocks(originalDates);


    // Return the final structure with items as Date[]
    return {
      items: processedDates,
    };
  }

  private removeFirstDayOfConsecutiveBlocks(dates: Date[]): Date[] {
    if (dates.length === 0) return [];

    // Sort ascending in-place (avoid copying for speed).
    dates.sort((a, b) => a.getTime() - b.getTime());

    // Simply return all dates, do not remove any.
    return dates;
  }
  private removeFirstDayOfConsecutiveBlocksLEGACY(dates: Date[]): Date[] {
    if (dates.length === 0) return [];

    // Sort ascending in-place (avoid copying for speed).
    dates.sort((a, b) => a.getTime() - b.getTime());

    const result: Date[] = [];
    let prevDate = dates[0]; // We'll skip this, as it's the "first" in its block.

    for (let i = 1; i < dates.length; i++) {
      const current = dates[i];
      const dayDiff =
        (current.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      // Only add `current` if it continues a block from the previous date (dayDiff === 1)
      // If dayDiff !== 1, we skip `current` because it's the first day of a new block.
      if (dayDiff === 1) {
        result.push(current);
      }
      // Regardless, track `current` as our new 'previous' date
      prevDate = current;
    }

    return result;
  }


}
/// HOSTAWAY ///
export class hostaway_listings_converter {
  private input: hostaway_listings;

  constructor(input: hostaway_listings) {
    this.input = input;
  }

  // CONVERTS INPUT TO CLIENT REQUIEREMENT
  public convert(): CLIENT_LISTINGS_OBJECT {
    return {
      id: this.IdToString(),
      href: "/listing-guesty",
      title: this.input.name,
      nickname: "",
      featuredImage: this.input?.listingImages[0]?.url || "",
      galleryImgs: this.getGalleryImages(),
      commentCount: 0,
      viewCount: 0,
      like: false,
      address: {
        full: this.input.address,
        city: this.input.city,
        country: this.input.country,
        lat: this.input.lat,
        lng: this.input.lng,
        state: this.input.state,
        street: this.input.zipcode

      },
      reviewStart: this.input.averageReviewRating || 0,
      reviewCount: 0,
      price: this.input.price.toString() || "",
      maxGuests: this.input.personCapacity || 0,
      bedrooms: this.input.bedroomsNumber || 0,
      bathrooms: this.input.bathroomsNumber || 0,

    };
  }

  // helper method to convert dates to iso format 
  //private convertDatesToISO8601(notAvailable: { date: string; for: string }[]): string[] {

  //const isoNotAvailable = notAvailable.map((item) => `${item.date}T00:00:00.000Z`);
  //return isoNotAvailable
  //}


  // Helper method to convert ID to string
  private IdToString(): string {
    return `${this.input.id}`;
  }

  // Helper method to format price as a string
  //private formatPrice(): string {
  //return `${this.input.original_min_price.toFixed(2)} ${this.input.currency_code}`;
  //}



  // Helper method to return gallery images
  private getGalleryImages(): string[] {
    // Returning same image for simplicity; update with real logic if necessary
    return this.input.listingImages.map((img) => img?.url);
  }
};
export class hostaway_listing_detail_converter {
  private input: hostaway_listing_details_returnType;

  constructor(input: hostaway_listing_details_returnType) {
    this.input = input;
  }



  // Method to convert input to front-end
  public convert(): CLIENT_LISTING_DETAILS_OBJECT {
    return {
      id: this.input.id.toString(),
      title: this.input.name,
      roomType: this.input.roomType,
      galleryImgs: this.getGalleryImages(),
      reviews: {
        avg: this.input.averageReviewRating || 0,
        total: 0,
        items: []
      },
      address: {
        city: this.input.city,
        country: this.input.country,
        full: this.input.publicAddress || this.input.address,
        lat: this.input.lat,
        lng: this.input.lng,
        state: this.input.state,
        street: this.input.street,
      },
      terms: {
        minNights: this.input.minNights,
        maxNights: this.input.maxNights
      },
      timezone: this.input.timeZoneName,
      prices: {
        lodgifyDisplayPrice: 0,
        max_price: 0,
        basePrice: this.input.price,
        currency: this.input.countryCode,
        monthlyPriceFactor: 0,
        weeklyPriceFactor: 0,
        extraPersonFee: 0,
        cleaningFee: 0,
        petFee: 1,
      },
      bathrooms: this.input.bathroomsNumber,
      bedrooms: this.input.bedroomsNumber,
      beds: this.input.bedsNumber,
      accommodates: this.input.personCapacity,
      amenities: this.getAmenities(this.input.listingAmenities || [])
      ,
      publicDescription: {

        summary: this.input.description,
      },
      thingsToknow: {
        checkInTime: this.formatHour(this.input.checkInTimeStart),
        checkOutTime: this.formatHour(this.input.checkOutTime)
      }

    };


  }
  // Private function that converts a number to a "HH:00" string.
  private formatHour(hour: number): string {
    const paddedHour = hour.toString().padStart(2, "0");
    return `${paddedHour}:00`;
  }

  // helper method to return amenities 
  private getAmenities(amenities: Array<{ amenityName: string }>): amenitiesType {
    const amenitiesArray = amenities.map((amenity: { amenityName: string }) => amenity?.amenityName || "")
    return amenitiesArray
  }

  // Helper method to return gallery images
  private getGalleryImages(): GalleryImages {
    return this.input.listingImages.map((img) => ({
      original: img.url || "",
    }));
  }
};
export class hostaway_listing_reviews_converter {
  private input: hostaway_listing_reviews_returnType;
  private validReviews: hostaway_review_object_type[];

  constructor(input: hostaway_listing_reviews_returnType) {
    this.input = input;
    // Compute the filtered reviews inside the constructor:
    this.validReviews = this.input.result.filter(
      (review: hostaway_review_object_type) => review.status === "published" && review.type === "guest-to-host");
  }

  // Convert the entire Hostaway reviews response into client format.
  public convert(): CLIENT_LISTING_REVIEWS_RETURN {



    return {
      total: this.validReviews.length,
      items: this.validReviews.map((review: hostaway_review_object_type) => {
        // If the main rating is null, compute an average from the reviewCategory array.
        const ratingScore =
          review.rating !== null
            ? review.rating.toString()
            : this.getAverageRating(review.reviewCategory);
        return {
          id: review.id.toString(),
          reviewText: review.publicReview || "Not available",
          createdDateTime: review.submittedAt || "Not available",
          expireAt: false,
          ratingScore: ratingScore,
          channelId: review.channelId,
        };
      }),
    };
  }
  // Private function that computes the average rating from the reviewCategory array.
  private getAverageRating(reviewCategories: any): string {
    if (!reviewCategories || reviewCategories.length === 0) {
      return "0";
    }
    const total = reviewCategories.reduce((sum, category) => sum + category.rating, 0);
    const average = total / reviewCategories.length;
    return average.toString();
  }
};
export class hostaway_listing_calendar_converter {
  private disabledDates: hostawayCalendarObjecttype[];

  constructor(private input: hostawayCalendarReturnType) {
    // Keep only non-available ("disabled") dates
    this.disabledDates = this.input.result.filter(
      (date) => date.status !== "available"
    );
  }

  public convert(): CLIENT_LISTING_CALENDAR_RETURN {
    // Convert each disabled date string into a Date object
    const originalDates: Date[] = this.disabledDates.map((d) =>
      parseISO(d.date)
    );

    // Remove the first date of each consecutive block (optimized single pass)
    const processedDates = this.removeFirstDayOfConsecutiveBlocks(originalDates);

    // Return the final structure with items as Date[]
    return {
      items: processedDates,
    };
  }

  /**
   * Removes the first date of each consecutive block in a sorted date array.
   * Example:
   *   Input block:  03/27, 03/28, 03/29 (all consecutive)
   *   Output:       03/28, 03/29       (skip 03/27)
   * Also, if a date is not consecutive to the previous date, that date begins a new block and is skipped.
   *
   * Returns a Date[] without the “first date” in each block.
   */
  private removeFirstDayOfConsecutiveBlocks(dates: Date[]): Date[] {
    if (dates.length === 0) return [];

    // Sort ascending in-place (avoid copying for speed).
    dates.sort((a, b) => a.getTime() - b.getTime());

    // Simply return all dates, do not remove any.
    return dates;
  }

  private removeFirstDayOfConsecutiveBlocksLegacy(dates: Date[]): Date[] {
    if (dates.length === 0) return [];

    // Sort ascending in-place (avoid copying for speed).
    dates.sort((a, b) => a.getTime() - b.getTime());

    const result: Date[] = [];
    let prevDate = dates[0]; // We'll skip this, as it's the "first" in its block.

    for (let i = 1; i < dates.length; i++) {
      const current = dates[i];
      const dayDiff =
        (current.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      // Only add `current` if it continues a block from the previous date (dayDiff === 1)
      // If dayDiff !== 1, we skip `current` because it's the first day of a new block.
      if (dayDiff === 1) {
        result.push(current);
      }
      // Regardless, track `current` as our new 'previous' date
      prevDate = current;
    }

    return result;
  }
}
export class hostaway_listing_quote_converter {
  private input: hostawayQuoteReturnType;

  constructor(input: hostawayQuoteReturnType) {
    this.input = input;
  }

  // Method to convert input to Listing_Quote_Client format
  public convert(): CLIENT_LISTING_QUOTE_OBJECT {
    const preTaxPrice = this.getPreTotalValue(this.input.result.components);
    const nights = this.input.result.lengthOfStay;
    const fees = this.convertInvoiceItems(this.input.result.components, "fee");
    const taxes = this.convertInvoiceItems(this.input.result.components, "tax");
    const totalFees = this.getInvoiceTotal(fees);
    const totalTaxes = this.getInvoiceTotal(taxes);
    const serviceFee = this.getServiceFee(this.input.result.components);
    const preTaxWithFeesPrice = preTaxPrice + serviceFee;

    const coupon = this.convertInvoiceItems(this.input.result.components, "coupon");
    const totalCoupon = coupon.reduce((acc, curr) => acc + curr.amount, 0);
    const addons = this.convertInvoiceItems(this.input.result.components, "addon");
    const totalAddons = addons.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      propertyId: "",
      currency: "USD",
      ratePlanId: "",

      // Date Information
      checkInDateLocalized: this.input.result.checkInDateLocalized || "not available",
      checkOutDateLocalized: this.input.result.checkOutDateLocalized || "not available",
      lengthOfStay: nights,
      // Booking Details
      guestsCount: this.input.result.guestsCount || 0,
      // Invoice Details
      preTotal: preTaxWithFeesPrice,
      nightlyTotal: preTaxWithFeesPrice,
      nightlyPrice: this.getPricePerNight(preTaxWithFeesPrice, nights),
      subTotal: (preTaxWithFeesPrice + totalFees) - (coupon && coupon.length > 0 ? Math.abs(totalCoupon) : 0),
      stayTotal: this.input.result.totalPrice + totalAddons,

      // Fees Information
      totalFees: totalFees,
      feesItems: fees,

      // Addon Information
      totalAddons: totalAddons,
      addonsItems: addons,

      // Taxes Information
      totalTaxes: totalTaxes,
      taxesItems: taxes,

      // Promoo Information
      totalPromo: totalCoupon,
      promoItems: coupon,

    }
  }
  private getServiceFee(components: any): number {
    return components
      .filter(component => component.name === "serviceFee")
      .reduce((sum, component) => sum + (component.value || 0), 0);
  }
  private getPreTotalValue(components: any): number {
    return components
      .filter(component => component.type === "accommodation")
      .reduce((sum, component) => sum + (component.value || 0), 0);
  }

  private getPricePerNight(totalPrice: number, nights: number): number {
    if (nights === 0) {
      throw new Error("Cannot divide by zero: nights is zero.");
    }

    return totalPrice / nights;
  }


  // Helper method to convert Invoice items
  private convertInvoiceItems(details: any, itemType: "tax" | "fee" | "coupon" | "addon") {
    // Items that we want to exclude by name
    const taxExclusions = new Set([]);
    const feeExclusions = new Set(["serviceFee"]);
    const discounts = new Set(["couponDiscount"]);
    const addonsExclusions = new Set([""]);

    return details
      // Exclude "accommodation" and "DISCOUNT"
      .filter((detail) => detail.type !== "accommodation")
      .filter((detail) => {
        if (itemType === "fee") {
          // Only keep detail.type = "fee" and exclude names in feeExclusions
          return detail.type === "fee" && !feeExclusions.has(detail.name);
        }

        if (itemType === "tax") {
          // Only keep detail.type = "tax" and exclude names in taxExclusions
          return detail.type === "tax" && !taxExclusions.has(detail.name);
        }

        if (itemType === "coupon") {
          return detail.type === "discount" && discounts.has(detail.name);
        }
        if (itemType === "addon") {
          return detail.type === null && !addonsExclusions.has(detail.name);
        }

        // For any other itemType, return false (exclude)
        return false;
      })
      // Format the final shape
      .map((detail) => ({
        title: detail.title.replace(/_/g, " "), // Replace underscores with spaces
        amount: detail.value,
        type: itemType, // "fee" or "tax"
        currency: "USD",
      }));
  }

  // Helper method to convert payments items
  private convertPaymentsItems(payments: { name: string; amount: number; isCurrent?: boolean; }[], currency: string, type: string) {
    return payments.map((payment) => ({
      title: payment.name,
      amount: payment.amount,
      type: type,
      currency,
      isCurrent: payment?.isCurrent
    }));
  }

  private getInvoiceTotal(invoiceItems: any) {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  };

};
export class hostaway_listing_addons_converter {
  private input: hostaway_listing_details_returnType;

  constructor(input: hostaway_listing_details_returnType) {
    this.input = input;
  }

  // Method to convert input to an array of CLIENT_LISTING_ADDONS_OBJECT
  public convert(): CLIENT_LISTING_ADDONS_OBJECT[] {
    const feeAddons = this.input
    return feeAddons.listingFeeSetting.filter(addon => addon.feeType !== "serviceFee").map((addon) => ({
      id: addon.id.toString(),
      type: addon.feeType,
      title: addon.feeTitle,
      description: addon.feeDescription,
      amount: addon.amount,
      amountType: addon.amountType,
      img: addon?.attachments[0]?.url || null,
      isMandatory: addon.isMandatory,
      feeAppliedPer: addon.feeAppliedPer,
      isQuantitySelectable: addon.isQuantitySelectable,
    }));
  }
}

/// CLIENT ///



















