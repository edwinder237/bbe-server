// Define an interface for your listings
interface Listing {
    address: {
      city: string;
      state: string;
      country: string;
    };
  }
  
  interface CityResult {
    city: string;
    state: string;
    country: string;
  }
  
  // Reusable function to get unique city results
  export function getLocations(listings: Listing[]): CityResult[] {
    const uniqueCitySet = new Set<string>();
    const cityResults: CityResult[] = [];
  
    for (const item of listings) {
      const { city, state, country } = item.address;
      // Create a key that uniquely identifies the combination
      const key = `${city}||${state}||${country}`;
  
      if (!uniqueCitySet.has(key)) {
        uniqueCitySet.add(key);
        cityResults.push({ city, state, country });
      }
    }
  
    return cityResults;
  }