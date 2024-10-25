import {
  lodgify_listings,
  guesty_listings,
  Lodgify_Listing_Details,
  Room_info_in_a_property_by_id,
  Property_info_by_Id_includeInOut,
  //
  guesty_listing_details,
  listings_search_client,
  listing_detail_client,
  lodgify_quote_beta,
  listing_quote_client

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
      commentCount: 0, // Assuming no comment data available, you can adjust
      viewCount: 0, // Assuming no view count data available, you can adjust
      like: false, // Assuming no like info available, you can adjust
      address: {
        full: this.input.address,
        city: this.input.city,
        country: this.input.country,
        lat: this.input.latitude ,
        lng: this.input.longitude,
        state: this.input.state,
        street: this.input.zip
        
      },
      reviewStart: this.input.rating,
      reviewCount: this.getReviewCount(),
      price: this.formatPrice(),
      maxGuests: this.calculateMaxGuests(),
      bedrooms: this.input.rooms.length, // Assuming each room is a bedroom
      bathrooms: 1, // Placeholder value; adjust based on data
      saleOff: "", // Assuming no sale info, adjust if available
      isAds: false, // Assuming no ad flag, adjust if available
      author: {
        id: 10, // Static value, adjust based on your logic
        firstName: "Mimi", // Static value, adjust based on your logic
        lastName: "Fones", // Static value, adjust based on your logic
        displayName: "Fones Mimi", // Static value, adjust based on your logic
        email: "mfones9@canalblog.com", // Static value, adjust based on your logic
        gender: "Agender", // Static value, adjust based on your logic
        avatar: "/static/media/Image-10.93048ca791076288cf69.png", // Placeholder
        count: 111, // Static value, adjust based on your logic
        href: "/author", // Static value
        desc: "There’s no stopping the tech giant. Apple now opens its 100th store in China.", // Placeholder
        jobName: "Author Job", // Placeholder
        bgImage:
          "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      }
    };
  }

  // Helper method to convert ID to string
  private IdToString(): string {
    return `${this.input.id}`;
  }

  // Helper method to format price as a string
  private formatPrice(): string {
    return `${this.input.min_price.toFixed(2)} ${this.input.currency_code}`;
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
      href: "/listing-stay-detail", // Static value, you can adjust this
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
    return `${this.input.prices.basePrice.toFixed(2)} ${
      this.input.prices.currency
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
      terms:{
        minNights: this.input.terms.minNights,
        maxNights: this.input.terms.maxNights
      } ,
      timezone: this.input.timezone,
      prices: this.input.prices,
      bathrooms: this.input.bathrooms,
      bedrooms: this.input.bedrooms,
      beds: this.input.beds,
      accommodates: this.input.accommodates,
      amenities: this.input.amenities
       ,
      publicDescription:{
        transit: this.input.publicDescription?.transit,
        neighborhood:this.input.publicDescription?.neighborhood,
        space: this.input.publicDescription?.space,
        access: this.input.publicDescription?.access,
        notes: this.input.publicDescription?.notes,
        interactionWithGuests: this.input.publicDescription?.interactionWithGuests,
        summary: this.input.publicDescription?.summary,
        houseRules: this.input.publicDescription?.houseRules
      },
      thingsToknow:{
        checkInTime:this.input?.defaultCheckInTime,
        checkOutTime:this.input?.defaultCheckOutTime,
      }
    };
  }
}

// CONVERTS LODGIFY DETAILS API => BBE DETAILS PAGE

export class client_lodgiy_listing_detail_V2_Converter {
  private input: Property_info_by_Id_includeInOut;

  constructor(input: Property_info_by_Id_includeInOut) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listing_detail_client {
    return {
      id: this.input.id.toString(),
      title: this.input.name,
      publicDescription: {
        transit: "" ,
        neighborhood:"",
        space: "",
        access: "",
        notes: "",
        interactionWithGuests: "string",
        summary: this.input.description,
        houseRules: "string",
      },
      prices: {
        max_price: this.input.max_price,
        basePrice:this.input.min_price,
        currency: this.input.currency_code,
      },
      galleryImgs: [],
      reviews: {
        avg: this.input.rating,
        total: 0,
      },
     // Ensure rooms is defined and has at least one room
roomId: this.input.rooms?.[0]?.id ?? 999, // Use optional chaining and default value,
      address: {
        city: this.input.city , 
        country: this.input.country , 
        full: this.input.address , 
        lat: this.input?.latitude ?? 0, 
        lng: this.input.longitude ?? 0, 
        state: this.input.state ,
        street: this.input.zip,
    }
      
    };
  }

}

export class client_lodgiy_listing_detail_Converter {
  private input: Lodgify_Listing_Details;

  constructor(input: Lodgify_Listing_Details) {
    this.input = input;
  }

  // Method to convert input to front-end
  public convert(): listing_detail_client {
    return {
      id: "000",
      title: "title here",
      publicDescription: {
        transit: "" ,
        neighborhood:"",
        space: "",
        access: "",
        notes: "",
        interactionWithGuests: "string",
        summary: this.input.description,
        houseRules: "string",
      },
      galleryImgs: this.input.imageUrls.map(url => ({ original: `https:${url}` })),
      reviews: {
        avg: this.input.reviews.averageRating,
        total: this.input.reviews.total,
      },
      address: {
        city: this.input.addressInfo.city , // Default to empty string if undefined
        country: this.input.addressInfo.country , // Default to empty string if undefined
        full: this.input.addressInfo.address , // Default to empty string if undefined
        lat: this.input.addressInfo.coordinates?.lat ?? 0, // Default to 0 if lat is undefined
        lng: this.input.addressInfo.coordinates?.lng ?? 0, // Default to 0 if lng is undefined
        state: this.input.addressInfo.stateProvince ,
        street: "",
    },
      bathrooms: this.input.keyFacts.bathrooms,
      bedrooms: this.input.keyFacts.bedrooms,
      beds: 0,
      accommodates: this.input.keyFacts.maxGuests,
      amenities: this.amenitiesConvert(),
    };
  }
  // Helper amenities to Array of strings
  private amenitiesConvert(): Array<string> {
    const amenitiesList = this.input.amenities;
    const lastWords: string[] = [];
    amenitiesList.forEach((amenity) => {
      amenity.amenities.forEach((item) => {
        const lastWord = item.split("-").pop();
        if (lastWord) {
          lastWords.push(lastWord.charAt(0).toUpperCase() + lastWord.slice(1));
        }
      });
    });

    return lastWords;
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

  // Method to convert input to front-end
  public convert(): listing_quote_client {
    return {
     
      rates: {
        ratePlans: [
          {
            ratePlan: {
              _id: "rateplan-id-001",
              name: "Standard Rate Plan",
              priceAdjustment: {
                type: "flat", // Could be an enum ('flat', etc.)
                direction: "decrease", // Could be an enum ('increase', 'decrease', etc.)
                amount: 50.00,
              },
              type: "default",
              mealPlans: [],
              cancellationPolicy: null,
              cancellationFee: null,
              description: "No special terms.",
              minNights: 3,
              rateStrategies: [],
              money: {
                currency: this.input.currencyCode,
                fareAccommodation: this.input.rentalPrice.total,
                fareAccommodationAdjusted: this.input.rentalPrice.totalWithPromotions,
                nightlyPrice: this.input.rentalPrice.nightlyPrice,
                fareCleaning: 100.00,
                totalFees: this.input.fees.total,
                subTotalPrice: 1300.00,
                hostPayout: 1100.00,
                hostPayoutUsd: 1100.00,
                totalTaxes: this.input.localTaxes.total ,
                invoiceItems: [
                  {
                    title: "Accommodation fare",
                    amount: 1200.00,
                    currency: "USD",
                    type: "ACCOMMODATION_FARE",
                    normalType: "AF",
                  },
                  {
                    title: "Cleaning fee",
                    amount: 100.00,
                    currency: "USD",
                    type: "CLEANING_FEE",
                    normalType: "CF",
                  },
                  {
                    title: "Tourism Tax",
                    amount: 100.00,
                    currency: "USD",
                    type: "TAX",
                    normalType: "TT",
                  },
                  {
                    title: "Local Tax",
                    amount: 50.00,
                    currency: "USD",
                    type: "TAX",
                    normalType: "LT",
                  },
                ],
              },
            },
            inquiryId: "inquiry-id-001",
            days: [
              {
                date: "2025-01-15",
                currency: "USD",
                rateStrategy: 0,
                ratePlan: 0,
                minNights: 3,
                maxNights: 365,
                manualPrice: 200.00,
                lengthOfStay: 7,
                price: 200.00,
              },
              {
                date: "2025-01-16",
                currency: "USD",
                rateStrategy: 0,
                ratePlan: 0,
                minNights: 3,
                maxNights: 365,
                manualPrice: 205.00,
                lengthOfStay: 7,
                price: 205.00,
              },
            ],
          },
        ],
      },
      coupons: [],
      numberOfGuests: {
        numberOfAdults: 2,
      },
      __v: 1,
      status: "valid",
      promotions: {},
    };
  }



}
