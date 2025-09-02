/**
 * Type definitions for BBE API v2
 * Based on OpenAPI specification in /api/api-spec/getListings.yml
 */

// Query parameters for listing search
export interface ListingsQuery {
    location?: string;
    guests?: number;
    startDate?: string;  // format: date (YYYY-MM-DD)
    endDate?: string;    // format: date (YYYY-MM-DD)
}

// Pagination parameters
export interface PaginationInput {
    page: number;        // minimum: 1
    pageSize: number;    // minimum: 9, maximum: 100
    includeTotals?: boolean;
}

// Sort parameters
export interface Sort {
    field?: 'price' | 'title' | 'createdAt' | 'random';
    direction?: 'asc' | 'desc';
}

// Locale settings
export interface Locale {
    lang?: string;      // ISO 639-1 (e.g., "en", "fr")
    currency?: string;  // Currency code (e.g., "USD", "EUR")
}

// Feature flags
export interface Features {
    debug?: boolean;
}

// Lodgify-specific configuration
export interface LodgifyConfig {
    siteUrl: string;    // format: uri
    siteId: string;
}

// Wix CMS parameters
export interface WixParams {
    siteURL: string;    // format: uri
}

// Integration configuration
export interface IntegrationConfig {
    integration: 'lodgify' | 'guesty' | 'hostaway';
    lodgify?: LodgifyConfig;
    wix_params?: WixParams;
}

// Main search request parameters
export interface SearchRequestParams {
    accessKey: string;  // format: uuid
    query?: ListingsQuery;
    pagination: PaginationInput;
    sort?: Sort;
    locale?: Locale;
    features?: Features;
    integrationConfig: IntegrationConfig;
}

// Internal params passed to action handlers
// This extends the API params with calculated values
export interface ActionParams {
    // From query
    location?: string;
    guests?: number;
    startDate?: string;
    endDate?: string;
    
    // Calculated pagination
    offset: number;     // Calculated from page: (page - 1) * pageSize
    limit: number;      // Same as pageSize
    includeTotals?: boolean;
    
    // From locale
    lang?: string;
    currency?: string;
    
    // From sort
    field?: 'price' | 'title' | 'createdAt' | 'random';
    direction?: 'asc' | 'desc';
    
    // Lodgify-specific (when integration === 'lodgify')
    lodgifySite?: {
        url: string;
        id: string;
    };
    default_Lang?: string;  // For lodgify
    
    // Other metadata
    search?: {
        guestsCount?: number;
        checkInDateLocalized?: string;
        checkOutDateLocalized?: string;
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
    };
}