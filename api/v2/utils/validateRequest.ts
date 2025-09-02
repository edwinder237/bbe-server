export interface SearchRequestBody {
    accessKey: string;
    query?: {
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
        guests?: number;
        startDate?: string;
        endDate?: string;
    };
    pagination?: {
        page?: number;
        pageSize?: number;
        includeTotals?: boolean;
    };
    sort?: {
        field?: 'price' | 'title' | 'createdAt' | 'random';
        direction?: 'asc' | 'desc';
    };
    locale?: {
        lang?: string;
        currency?: string;
    };
    features?: {
        debug?: boolean;
    };
    integrationConfig: {
        integration: 'lodgify' | 'guesty' | 'hostaway';
        lodgify?: {
            siteUrl: string;
            siteId: string;
        };
        wix_params?: {
            siteURL: string;
        };
    };
}

export interface ErrorResponse {
    error: {
        code: string;
        message: string;
        integration?: string | null;
    };
    trace?: {
        requestId?: string;
    };
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function validateRequest(body: SearchRequestBody, requestId: string): ErrorResponse | null {
    if (!body.accessKey) {
        return {
            error: {
                code: 'BAD_REQUEST',
                message: 'accessKey is required',
                integration: null
            },
            trace: { requestId }
        };
    }

    if (!UUID_REGEX.test(body.accessKey)) {
        return {
            error: {
                code: 'BAD_REQUEST',
                message: 'accessKey must be a valid UUID',
                integration: null
            },
            trace: { requestId }
        };
    }

    if (!body.integrationConfig || !body.integrationConfig.integration) {
        return {
            error: {
                code: 'BAD_REQUEST',
                message: 'integrationConfig.integration is required',
                integration: null
            },
            trace: { requestId }
        };
    }

    const integration = body.integrationConfig.integration;

    if (!['lodgify', 'guesty', 'hostaway'].includes(integration)) {
        return {
            error: {
                code: 'BAD_REQUEST',
                message: 'integration must be one of: lodgify, guesty, hostaway',
                integration: null
            },
            trace: { requestId }
        };
    }

    if (integration === 'lodgify') {
        if (!body.integrationConfig.lodgify) {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'integrationConfig.lodgify is required when integration=lodgify',
                    integration: 'lodgify'
                },
                trace: { requestId }
            };
        }

        if (!body.integrationConfig.lodgify.siteUrl || !body.integrationConfig.lodgify.siteId) {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'integrationConfig.lodgify.siteUrl and siteId are required',
                    integration: 'lodgify'
                },
                trace: { requestId }
            };
        }

        if (!body.locale || !body.locale.lang) {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'locale.lang is required when integration=lodgify',
                    integration: 'lodgify'
                },
                trace: { requestId }
            };
        }
    }

    // Pagination is now optional - if provided, validate the values
    if (body.pagination) {
        const { page, pageSize } = body.pagination;

        if (page !== undefined && page < 1) {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'pagination.page must be >= 1',
                    integration: null
                },
                trace: { requestId }
            };
        }

        if (pageSize !== undefined && (pageSize < 9 || pageSize > 100)) {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'pagination.pageSize must be between 9 and 100',
                    integration: null
                },
                trace: { requestId }
            };
        }

        // Check Guesty's 100 listing limit if pagination is provided
        if (integration === 'guesty' && page && pageSize && page * pageSize > 100) {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Guesty integration supports a maximum of 100 listings total',
                    integration: 'guesty'
                },
                trace: { requestId }
            };
        }
    }

    if (body.integrationConfig.wix_params?.siteURL) {
        try {
            new URL(body.integrationConfig.wix_params.siteURL);
        } catch {
            return {
                error: {
                    code: 'BAD_REQUEST',
                    message: 'integrationConfig.wix_params.siteURL must be a valid URI',
                    integration: null
                },
                trace: { requestId }
            };
        }
    }

    return null;
}