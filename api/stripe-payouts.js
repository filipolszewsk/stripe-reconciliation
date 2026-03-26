// Vercel Serverless Function - Stripe Payouts API
// Endpoint: GET /api/stripe-payouts
// Returns list of payouts to bank account

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

    // Support multiple Stripe accounts via ?account=1|2
    const account = req.query.account || '1';
    const keyName = account === '2' ? 'STRIPE_SECRET_KEY_2' : 'STRIPE_SECRET_KEY';
    const stripeSecretKey = process.env[keyName];
    if (!stripeSecretKey) {
        return res.status(500).json({ error: `${keyName} not configured` });
    }

    const stripe = new Stripe(stripeSecretKey);

    try {
        const { limit = 100, starting_after } = req.query;

        const queryParams = {
            limit: Math.min(parseInt(limit), 100)
        };

        if (starting_after) {
            queryParams.starting_after = starting_after;
        }

        // Fetch payouts
        const payouts = await stripe.payouts.list(queryParams);

        // Transform data
        const payoutData = payouts.data.map(payout => ({
            id: payout.id,
            amount: (payout.amount / 100).toFixed(2),
            currency: payout.currency,
            status: payout.status,
            arrival_date: new Date(payout.arrival_date * 1000).toISOString().split('T')[0],
            created: new Date(payout.created * 1000).toISOString().replace('T', ' ').slice(0, 19),
            description: payout.description,
            destination: payout.destination,
            method: payout.method,
            type: payout.type
        }));

        res.status(200).json({
            success: true,
            data: payoutData,
            has_more: payouts.has_more,
            last_id: payouts.data.length > 0 ? payouts.data[payouts.data.length - 1].id : null,
            count: payoutData.length
        });

    } catch (error) {
        console.error('Stripe API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch payouts',
            message: error.message
        });
    }
};
