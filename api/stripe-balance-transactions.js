// Vercel Serverless Function - Stripe Balance Transactions API
// Endpoint: GET /api/stripe-balance-transactions
// Returns all balance transactions with payout info (the most complete data source)

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
        const { limit = 100, starting_after, type, payout } = req.query;

        const queryParams = {
            limit: Math.min(parseInt(limit), 100),
            expand: ['data.source', 'data.source.payment_intent']
        };

        if (starting_after) {
            queryParams.starting_after = starting_after;
        }

        // Filter by type (charge, payout, refund, etc.)
        if (type) {
            queryParams.type = type;
        }

        // Filter by specific payout
        if (payout) {
            queryParams.payout = payout;
        }

        // Fetch balance transactions
        const transactions = await stripe.balanceTransactions.list(queryParams);

        // Transform data to match unified_payments.csv structure
        const data = transactions.data.map(tx => {
            const source = tx.source;
            const isCharge = tx.type === 'charge' || tx.type === 'payment';
            
            // Extract payment intent ID
            let paymentIntentId = '';
            if (source && typeof source === 'object') {
                paymentIntentId = source.payment_intent || '';
            }

            // Extract customer email
            let customerEmail = '';
            if (source && typeof source === 'object') {
                customerEmail = source.billing_details?.email || 
                               source.receipt_email || 
                               source.metadata?.email || '';
            }

            return {
                id: tx.id,
                source_id: typeof source === 'string' ? source : source?.id || '',
                'PaymentIntent ID': paymentIntentId,
                type: tx.type,
                'Created date (UTC)': new Date(tx.created * 1000).toISOString().replace('T', ' ').slice(0, 19),
                Amount: (tx.amount / 100).toFixed(2),
                Fee: (tx.fee / 100).toFixed(2),
                Net: (tx.net / 100).toFixed(2),
                Currency: tx.currency,
                Status: tx.status,
                Description: tx.description || '',
                'Customer Email': customerEmail,
                // Payout info - key field!
                payout_id: tx.payout || '',
                available_on: new Date(tx.available_on * 1000).toISOString().split('T')[0],
                // Payment method details (if available)
                'Payment Source Type': source?.payment_method_details?.type || '',
                'Card Brand': source?.payment_method_details?.card?.brand || '',
                'Card Last4': source?.payment_method_details?.card?.last4 || '',
                // Raw source status
                source_status: source?.status || ''
            };
        });

        res.status(200).json({
            success: true,
            data: data,
            has_more: transactions.has_more,
            last_id: transactions.data.length > 0 ? transactions.data[transactions.data.length - 1].id : null,
            count: data.length
        });

    } catch (error) {
        console.error('Stripe API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch balance transactions',
            message: error.message
        });
    }
};
