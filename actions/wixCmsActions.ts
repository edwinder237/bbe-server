import { handleFetch } from "../utils/handleFetching";

import { FetchResponse, internal_ID } from "../utils/types";

interface wix_paramsType {
    wix_req: string | boolean;
    siteURL?: string;
    listingId?: number;
};
interface wixCmsApiParams {
    wix_params: wix_paramsType;
    internal_ID?: internal_ID;
};

// Helper function to fetch Lodgify data with timeout
const fetchwixCmsData = async ({ endpointUrl, action, method }): Promise<any> => {


    const options: RequestInit = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
    };
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout fetching data from ${action}`)), 10000) // 10-second timeout
    );
    try {
        const fetchPromise = handleFetch({ fetchUrl: endpointUrl, options, action }) as Promise<FetchResponse>;
        const response = await Promise.race([fetchPromise, timeout]);
        if (!response.success) {
            throw new Error(`Failed to fetch data from ${action}: ${response.message}`);
        }

        return response.data;
    } catch (error) {
        console.error(`Error in fetchLodgifyData: ${error.message}`);
        throw error;
    }
};


export const wixCmsFetchers = {
    fetchListings: async ({ wix_params }:wixCmsApiParams) => {

        const endpointUrl = `${wix_params.siteURL}/_functions/wixCms`;
        const action = "fetchwixCmsListings";
        const method = "GET";
        const response = await fetchwixCmsData({ endpointUrl, action, method });
        return response;
    },
    fetchListingDetails: async ({ internal_ID, wix_params }:wixCmsApiParams) => {
        const endpointUrl = `${wix_params.siteURL}/_functions/wixCmsById?clientId=${internal_ID}&id=${wix_params.listingId}`;
        const action = "fetchwixCmsListingDetails";
        const method = "GET";
        const response = await fetchwixCmsData({ endpointUrl, action, method });
        return response;
    }

};