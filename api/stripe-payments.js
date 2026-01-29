// Vercel Serverless Function - Stripe Payments API
// Endpoint: GET /api/stripe-payments
// Query params: ?limit=100&starting_after=xyz (for pagination)

const Stripe = require('stripe');

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for API key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        const { limit = 100, starting_after, created_gte, created_lte } = req.query;

        // Build query params
        const queryParams = {
            limit: Math.min(parseInt(limit), 100),
            expand: ['data.balance_transaction']
        };

        if (starting_after) {
            queryParams.starting_after = starting_after;
        }

        // Date filtering (Unix timestamps)
        if (created_gte || created_lte) {
            queryParams.created = {};
            if (created_gte) queryParams.created.gte = parseInt(created_gte);
            if (created_lte) queryParams.created.lte = parseInt(created_lte);
        }

        // Fetch charges (includes card, blik, etc.)
        const charges = await stripe.charges.list(queryParams);

        // Transform to match the unified_payments.csv structure
        const payments = charges.data.map(charge => {
            const balanceTx = charge.balance_transaction;
            
            return {
                id: charge.id,
                'PaymentIntent ID': charge.payment_intent,
                'Created date (UTC)': new Date(charge.created * 1000).toISOString().replace('T', ' ').slice(0, 19),
                Amount: (charge.amount / 100).toFixed(2),
                'Amount Refunded': (charge.amount_refunded / 100).toFixed(2),
                Currency: charge.currency,
                Captured: charge.captured,
                'Converted Amount': balanceTx ? (balanceTx.amount / 100).toFixed(2) : '',
                'Converted Currency': balanceTx ? balanceTx.currency : '',
                Fee: balanceTx ? (balanceTx.fee / 100).toFixed(2) : '0.00',
                Net: balanceTx ? (balanceTx.net / 100).toFixed(2) : '',
                Status: charge.status === 'succeeded' ? 'Paid' : charge.status === 'failed' ? 'Failed' : 'Pending',
                'Seller Message': charge.outcome ? charge.outcome.seller_message : '',
                'Decline Reason': charge.failure_code || '',
                Description: charge.description || '',
                'Customer Email': charge.billing_details?.email || charge.receipt_email || '',
                'Card Brand': charge.payment_method_details?.card?.brand || '',
                'Card Last4': charge.payment_method_details?.card?.last4 || '',
                'Payment Source Type': charge.payment_method_details?.type || '',
                // Payout info from balance transaction
                Transfer: balanceTx?.source?.transfer || '',
                // Check if this charge is part of a payout
                _payoutId: null, // Will be enriched below
                _raw: {
                    chargeId: charge.id,
                    balanceTransactionId: balanceTx?.id
                }
            };
        });

        // Return response
        res.status(200).json({
            success: true,
            data: payments,
            has_more: charges.has_more,
            last_id: charges.data.length > 0 ? charges.data[charges.data.length - 1].id : null,
            count: payments.length
        });

    } catch (error) {
        console.error('Stripe API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch Stripe data',
            message: error.message
        });
    }
};
