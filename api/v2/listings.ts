import type { VercelRequest, VercelResponse } from "@vercel/node";
import { guestyActions } from "../../actions/guestyActions";
import { lodgifyActions } from "../../actions/lodgifyActions";
import { hostawayActions } from "../../actions/hostawayActions";
import { wixCmsFetchers } from "../../actions/wixCmsActions";
import { 
    CLIENT_LISTINGS_RETURN,
    actionsParams 
} from "../../utils/types";
import { ActionParams } from "./types";
import { validateRequest, SearchRequestBody, ErrorResponse } from "./utils/validateRequest";


async function fetchListings(body: SearchRequestBody): Promise<any> {
    const { integrationConfig, query, locale, sort } = body;
    const integration = integrationConfig.integration;
    
    // Default pagination values based on integration
    const integrationDefaults = {
        lodgify: { minPageSize: 12 },
        guesty: { minPageSize: 9 },
        hostaway: { minPageSize: 12 }
    };
    
    // Apply pagination defaults if not provided
    const pagination = body.pagination || {
        page: 1,
        pageSize: integrationDefaults[integration].minPageSize,
        includeTotals: true
    };
    
    // Ensure individual pagination properties have defaults
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || integrationDefaults[integration].minPageSize;
    const includeTotals = pagination.includeTotals !== undefined ? pagination.includeTotals : true;
    
    // Check if we have search parameters
    const hasSearchParams = query && (
        query.location || query.guests || query.startDate || query.endDate
    );

    const params: any = {
        ...query,
        offset: page - 1,  // page 1 = offset 0, page 2 = offset 1, etc.
        limit: pageSize,
        includeTotals: includeTotals,
        ...locale,
        ...sort,
        // Only include search object if we have search parameters
        ...(hasSearchParams ? {
            search: {
                guestsCount: query?.guests,  // Only use 'guests', as 'guest' is not defined in type
                checkInDateLocalized: query?.startDate,
                checkOutDateLocalized: query?.endDate,
                location: {
                    city: query?.location?.city || "",
                    state: query?.location?.state || "",
                    country: query?.location?.country || ""
                }
            }
        } : {}),
        // Add lodgifySite for lodgify integration
        ...(integration === 'lodgify' && integrationConfig.lodgify ? {
            lodgifySite: {
                url: integrationConfig.lodgify.siteUrl,
                id: integrationConfig.lodgify.siteId
            },
            default_Lang: locale?.lang || 'en'
        } : {})
    };
console.log(integration,params)
    const internal_ID = body.accessKey;
    const wix_params = integrationConfig.wix_params;

    let result: any;
    let wixData: any = null;

    if (wix_params?.siteURL) {
        try {
            wixData = await wixCmsFetchers.fetchListings({ 
                wix_params: { 
                    ...wix_params, 
                    wix_req: 'true' 
                } 
            });
        } catch (error) {
            console.error('Failed to fetch Wix CMS data:', error);
        }
    }

    switch (integration) {
        case 'guesty':
            if (hasSearchParams) {
                result = await guestyActions.getlistingsV2({ internal_ID, params });
            } else {
                result = await guestyActions.getlistings({ internal_ID, params });
            }
            break;

        case 'lodgify':
            const lodgifyWixParams = wix_params ? { ...wix_params, wix_req: 'true' } : undefined;
            result = await lodgifyActions.getListings({ 
                internal_ID, 
                params, 
                wix_params: lodgifyWixParams
            });
            break;

        case 'hostaway':
            result = await hostawayActions.getlistings({ internal_ID, params });
            break;

        default:
            throw new Error(`Unsupported integration: ${integration}`);
    }

    if (wixData && result?.listings) {
        result.listings = enrichWithWixData(result.listings, wixData);
    }
   // console.log("results",result)
    return formatResponse(result, body, integration);
}

function enrichWithWixData(listings: any[], wixData: any): any[] {
    if (!wixData?.listings || !Array.isArray(wixData.listings)) {
        return listings;
    }

    return listings.map(listing => {
        const wixListing = wixData.listings.find(
            (w: any) => w.internal_ID === listing.internal_ID || 
                       w.title === listing.title
        );

        if (wixListing) {
            return {
                ...listing,
                images: wixListing.images || listing.images,
                additionalInfo: {
                    ...listing.additionalInfo,
                    ...wixListing.additionalInfo
                }
            };
        }

        return listing;
    });
}

function formatResponse(data: any, request: SearchRequestBody, integration: string): any {
    // Get pagination with defaults
    const integrationDefaults = {
        lodgify: { minPageSize: 12 },
        guesty: { minPageSize: 9 },
        hostaway: { minPageSize: 12 }
    };
    
    const pagination = request.pagination || {
        page: 1,
        pageSize: integrationDefaults[integration].minPageSize,
        includeTotals: true
    };
    
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || integrationDefaults[integration].minPageSize;
    const includeTotals = pagination.includeTotals !== undefined ? pagination.includeTotals : true;
    
    // Check if search filters are applied
    const hasQuery = request.query && (
        request.query.location || 
        request.query.guests || 
        request.query.startDate || 
        request.query.endDate
    );
    
    const items = (data?.items || []).map((listing: any) => ({
        id: listing.internal_ID || listing.id,
        integration,
        integrationId: listing.internal_ID || listing.id,
        title: listing.title || listing.name || '',
        price: {
            amount: listing.price?.amount || listing.price || 0,
            currency: listing.price?.currency || request.locale?.currency || 'USD'
        },
        ...listing
    }));

    const totalItems = data?.total || data?.totalItems;
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : undefined;

    // Include matched field when query is provided and includeTotals is true
    const includeMatched = hasQuery && includeTotals;

    return {
        items,
        pagination: {
            page: page,
            pageSize: pageSize,
            totalItems: includeTotals ? totalItems : undefined,
            totalPages: includeTotals ? totalPages : undefined
        },
        ...(includeMatched && totalItems ? { matched: totalItems } : {}),
        aggregations: data?.aggregations,
        integrationMeta: {
            integration,
            ...data?.meta
        },
        trace: {
            requestId: request.features?.debug ? data?.requestId : undefined
        }
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const requestId = (req.headers['x-request-id'] as string) || `r${Date.now()}`;
    
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id, Idempotency-Key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const body = req.body as SearchRequestBody;
            
            const validationError = validateRequest(body, requestId);
            if (validationError) {
                return res.status(400).json(validationError);
            }

            const result = await fetchListings(body);
            return res.status(200).json(result);

        } catch (error: any) {
            console.error('Error processing request:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
                integration: req.body?.integrationConfig?.integration
            });
            
            // Extract more detailed error information if available
            let errorCode = error.code || 'INTEGRATION';
            let errorMessage = error.message || 'An error occurred processing your request';
            
            // If the error message contains structured error info, try to extract it
            if (error.message && error.message.includes('WRONG_REQUEST_PARAMETERS')) {
                errorCode = 'WRONG_REQUEST_PARAMETERS';
                errorMessage = error.message;
            }
            
            const errorResponse: ErrorResponse = {
                error: {
                    code: errorCode,
                    message: errorMessage,
                    integration: req.body?.integrationConfig?.integration || null
                },
                // integrationError is not a valid property of ErrorResponse, so remove it
                trace: { requestId }
            };

            const statusCode = error.statusCode || 502;
            return res.status(statusCode).json(errorResponse);
        }
    }

    return res.status(405).json({
        error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only POST method is allowed',
            integration: null
        },
        trace: { requestId }
    });
}