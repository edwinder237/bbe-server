import {
  lodgify_listings,
  lodgify_listings_details,
  guesty_listings,
  Lodgify_Listing_Details_BETA,
  Room_info_in_a_property_by_id,
  Property_info_by_Id_includeInOut,
  //
  guesty_listing_details,
  listings_search_client,
  listing_detail_client,
  lodgify_quote_beta,
  guesty_quote,
  Listing_Quote_Client

} from "./types";

// Create a class to handle the conversion
export class ListingConverter {
  private input: lodgify_listings;

  constructor(input: lodgify_listings) {
    this.input = input;
  }

  // CONVERTS INPUT TO CLIENT REQUIEREMENT
  public convert(): listings_search_client {
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
    };
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
}

export class GuestyConverter {
  private input: guesty_listings;

  constructor(input: guesty_listings) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listings_search_client {
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
}
// CONVERTS LISTING DETAILS PAGE
export class client_listing_detail_Converter {
  private input: guesty_listing_details;

  constructor(input: guesty_listing_details) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listing_detail_client {
    return {
      id: this.input._id,
      title: this.input.title,
      roomType: this.input.roomType,
      galleryImgs: this.input.pictures,
      reviews: {
        avg: this.input.reviews.avg,
        total: this.input.reviews.total,
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
      }
    };
  }
}

// CONVERTS LODGIFY DETAILS API => BBE DETAILS PAGE

export class LODGIFY_DETAILS_TO_LISTING_DETAILS_FORMAT {
  private input: lodgify_listings_details;

  constructor(input: lodgify_listings_details) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listing_detail_client {
    return {
      id: this.input.id.toString(),
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



}

export class LODGIFY_ROOM_INFO_TO_LISTING_DETAILS_FORMAT {
  private input: Room_info_in_a_property_by_id;

  constructor(input: Room_info_in_a_property_by_id) {
    this.input = input;
  }

  // Method to convert input to front-end format
  public convert(): listing_detail_client {
    return {
      galleryImgs: this.convertIMGs(this.input.images),
      amenities: this.getAmenities(this.input.amenities),

    };
  }

  // Helper method to convert images array to client format => [{original:"imgurl"}]
  private convertIMGs(imgsArray: { url: string }[]): { original: string }[] {
    return imgsArray.map((img) => ({
      original: `https:${img.url}`,
    }));
  }

  // Method to aggregate amenities into a single array of strings
  private getAmenities(amenitiesArray: Record<string, { text: string }[] | unknown[]>): string[] {
    const allAmenities: string[] = [];

    // Filter and process only entries that match the `{ text: string }[]` structure
    Object.values(amenitiesArray).forEach((category) => {
      if (Array.isArray(category) && category.every(item => item && typeof item === 'object' && 'text' in item)) {
        (category as { text: string }[]).forEach((amenity) => {
          if (amenity.text) {
            allAmenities.push(amenity.text);
          }
        });
      }
    });

    return allAmenities;
  }
}

export class LODGIFY_DETAILS_BETA_TO_LISTING_DETAILS_FORMAT { //make sure to add ? on all deconstruction
  private input: Lodgify_Listing_Details_BETA;

  constructor(input: Lodgify_Listing_Details_BETA) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listing_detail_client {
    return {
      hostLanguages: this.input.ownerSpokenLanguages ?? [],
      publicDescription: {
        transit: "",
        neighborhood: "",
        space: "",
        access: "",
        notes: "",
        interactionWithGuests: "",
        summary: this.input?.description ?? "",
        houseRules: "",
      },
      beds: this.input?.sleepingArrangements?.length ?? 0,

      reviews: {
        avg: this.input?.reviews?.averageRating ?? 0,
        total: this.input?.reviews?.total ?? 0,
      },

      roomId: this.input?.rooms?.[0]?.id ?? 999, // Default to 999 if roomId is undefined

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

}




export class client_lodgiy_listing_info_Converter {
  private input: Room_info_in_a_property_by_id;

  constructor(input: Room_info_in_a_property_by_id) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listing_detail_client {
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


}

export class LODGIFY_QUOTE_TO_CLIENT_LISTING_QUOTE {
  private input: lodgify_quote_beta;

  constructor(input: lodgify_quote_beta) {
    this.input = input;
  }

  // Method to convert input to Listing_Quote_Client format
  public convert(): Listing_Quote_Client {
    return {
      propertyId: this.input.propertyId.toString(),
      currency: this.input.currencyCode,

      // Date Information
      lengthOfStay: this.input?.rentalPrice?.nights,

      // Invoice Details
      preTotal: this.input.totalPrice.totalExcSalesTaxes,
      nightlyTotal: this.input.rentalPrice.total,
      nightlyPrice: this.input.rentalPrice.nightlyPrice,
      subTotal: this.input.totalPrice.totalExcSalesTaxes,
      stayTotal: this.input.totalPrice.total,

      // Fees Information
      totalFees: (this.input.fees?.total ?? 0) + (this.input.localTaxes?.total ?? 0),
      feesItems: this.convertInvoiceItems(this.input.fees.details,this.input.localTaxes.details, this.input.currencyCode, "fee"),

      // Taxes Information
      totalTaxes: this.input.totalPrice.salesTaxes,
      taxesItems: this.getSalesTaxes(this.input.totalPrice.salesTaxes, this.input.currencyCode),

      // Taxes Information
      otherItems: this.convertPaymentsItems(this.input.scheduledPayments.payments, this.input.currencyCode, "deposit"),
    };
  }

  private getSalesTaxes(taxAmount:number,currency:string) {
    return [{
      title: "sales tax",
      amount: taxAmount,
      type: "tax",
      currency,
    }];
  }


  // Helper method to convert Invoice items
  private convertInvoiceItems(
    fees: { name: string; value: number }[],
    taxes: { name: string; value: number }[],
    currency: string,
    type: string
  ) {
    const Fees = fees.map((detail) => ({
      title: detail.name,
      amount: detail.value,
      type: type,
      currency,
    }));
  
    const Taxes = taxes.map((detail) => ({
      title: detail.name,
      amount: detail.value,
      type: type,
      currency,
    }));
  
    return [...Fees, ...Taxes];
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

export class GUESTY_QUOTE_TO_CLIENT_LISTING_QUOTE {
  private input: guesty_quote;

  constructor(input: guesty_quote) {
    this.input = input;
  }

  // Method to convert input to Listing_Quote_Client format
  public convert(): Listing_Quote_Client {
    const quote = this.input.rates?.ratePlans[0].ratePlan?.money;
    const quoteParams = this.input.rates?.ratePlans[0];
    return {
      quoteId: this.input._id,
      createdAt: this.input.createdAt,
      expiresAt: this.input.expiresAt,
      propertyId: this.input.createdAt,
      currency: quote.currency,

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
      nightlyTotal:quote.fareAccommodation,
      nightlyPrice: this.getNightlyCost(quote.fareAccommodation, quoteParams.days.length),
      subTotal: quote.subTotalPrice,
      stayTotal: quote.hostPayout,

      // Fees Information
      totalFees: quote.totalFees,
      feesItems: this.convertInvoiceItems(quote.invoiceItems,"fee"),

      // Taxes Information
      totalTaxes: quote.totalTaxes,
      taxesItems: this.convertInvoiceItems(quote.invoiceItems,"tax"),

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
