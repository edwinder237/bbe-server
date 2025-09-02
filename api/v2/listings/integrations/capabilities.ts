import type { VercelRequest, VercelResponse } from "@vercel/node";

const INTEGRATION_CAPABILITIES = {
    lodgify: {
        name: 'lodgify',
        pagination: 'offset',
        minPageSize: 12,
        maxPageSize: 100,
        supportsTotals: true,
        totalListingsLimit: null,
        notes: 'Language required in locale.lang. integrationConfig.lodgify with siteUrl and siteId required'
    },
    guesty: {
        name: 'guesty',
        pagination: 'cursor',
        minPageSize: 9,
        maxPageSize: 100,
        supportsTotals: false,
        totalListingsLimit: 100,
        notes: 'Max 100 listings total across all pages'
    },
    hostaway: {
        name: 'hostaway',
        pagination: 'offset',
        minPageSize: 12,
        maxPageSize: 100,
        supportsTotals: true,
        totalListingsLimit: null,
        notes: null
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const requestId = (req.headers['x-request-id'] as string) || `r${Date.now()}`;
    
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            integrations: Object.values(INTEGRATION_CAPABILITIES)
        });
    }

    return res.status(405).json({
        error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only GET method is allowed',
            integration: null
        },
        trace: { requestId }
    });
}