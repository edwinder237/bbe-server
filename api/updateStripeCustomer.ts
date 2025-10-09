/**
 * Stripe Customer Update API
 * 
 * PURPOSE:
 * Updates Stripe customer metadata with referral tracking information for Rewardful integration.
 * This API waits for Guesty to create the Stripe customer first, then updates it with referral data.
 * 
 * FLOW:
 * 1. Guesty creates reservation and Stripe customer (happens first)
 * 2. Frontend waits 5 seconds then calls this API
 * 3. API searches for customer by email (with retry logic)
 * 4. Once found, updates customer metadata with referral info
 * 5. Returns success/failure status (always HTTP 200 for better error handling)
 * 
 * REQUEST BODY:
 * - email: Customer email (required) - used to find Stripe customer
 * - name: Customer full name (optional)
 * - metadata: Additional metadata to attach (optional)
 * - referralId: Rewardful referral ID (optional) - added to metadata
 * 
 * RESPONSE:
 * Always returns HTTP 200 with:
 * - success: boolean indicating if operation succeeded
 * - customer: Stripe customer object (null if failed)
 * - message: Human-readable status message
 * - error: Error details (null if succeeded)
 * 
 * ENVIRONMENT:
 * Requires STRIPE_SECRET_KEY environment variable
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../utils/corsMiddleware';

interface StripeCustomerResponse {
  id: string;
  object: string;
  email: string;
  name?: string;
  created: number;
  metadata?: Record<string, string>;
}

interface UpdateCustomerRequest {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
  referralId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isPreflight = corsMiddleware(req, res);
  if (isPreflight) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, metadata, referralId }: UpdateCustomerRequest = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeApiKey) {
      console.error('[Stripe] Missing API key');
      return res.status(500).json({ error: 'Stripe configuration error' });
    }

    // RETRY LOGIC: Wait for Guesty to create the Stripe customer
    // Guesty creates customers asynchronously after reservation creation
    // We poll Stripe's search API until the customer appears
    const maxWaitMs = 20000;     // Max 20 seconds total wait time
    let delay = 800;             // Start with 800ms delay
    const started = Date.now();
    let found: StripeCustomerResponse | null = null;

    while (Date.now() - started < maxWaitMs) {
      // Search for customer by email in Stripe
      const searchUrl = `https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(`email:"${email}"`)}`;
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (Array.isArray(searchData?.data) && searchData.data.length > 0) {
          found = searchData.data[0] as StripeCustomerResponse;
          break;
        }
      }

      // Exponential backoff with jitter to avoid overwhelming Stripe API
      await new Promise(r => setTimeout(r, delay + Math.floor(Math.random() * 150)));
      delay = Math.min(Math.floor(delay * 1.7), 3000);  // Cap at 3 seconds
    }

    if (!found) {
      console.warn(`[Stripe] Customer for ${email} not found within window`);
      // Return 200 with success: false instead of 404 for better error handling
      return res.status(200).json({ 
        success: false,
        error: 'Customer not found in Stripe',
        message: `No Stripe customer found for email: ${email}`,
        customer: null
      });
    }

    console.log('[Stripe] Found existing customer:', found.id);

    // BUILD METADATA: Combine provided metadata with referral ID
    // The referral ID is critical for Rewardful tracking
    const meta = {
      ...(metadata || {}),
      ...(referralId ? { referral: referralId } : {}),
    };

    // BUILD REQUEST: Stripe requires form-urlencoded format for customer updates
    const body = new URLSearchParams();
    if (name) {
      body.append('name', name);
    }
    // Add each metadata field as metadata[key]=value
    Object.entries(meta).forEach(([k, v]) => body.append(`metadata[${k}]`, String(v ?? '')));

    // UPDATE CUSTOMER: Call Stripe API to update the customer
    const updateResponse = await fetch(
      `https://api.stripe.com/v1/customers/${found.id}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      console.warn('[Stripe] Metadata update failed:', updateResponse.status, updateData);
      // Return 200 with success: false for consistent error handling
      return res.status(200).json({
        success: false,
        error: 'Failed to update customer',
        details: updateData,
        customer: null
      });
    }

    console.log('[Stripe] ✅ Updated Customer metadata:');
    return res.status(200).json({
      success: true,
      customer: updateData,
      message: 'Customer updated successfully',
      error: null
    });
  

  } catch (error) {
    console.error('[Stripe] ❌ Error updating customer:', error);
    return res.status(200).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      customer: null
    });
  }
}