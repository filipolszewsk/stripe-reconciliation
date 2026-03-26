// Vercel Serverless Function - Unified Stripe Data
// Endpoint: GET /api/stripe-unified
// Returns complete payment data with payout status (replaces unified_payments.csv)

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
        const { 
            limit = 100, 
            days = 90,  // Default: last 90 days
            starting_after 
        } = req.query;

        // Calculate date range
        const now = Math.floor(Date.now() / 1000);
        const startDate = now - (parseInt(days) * 24 * 60 * 60);

        // Fetch all balance transactions (charges only) with pagination
        let allTransactions = [];
        let hasMore = true;
        let lastId = starting_after || null;
        const maxIterations = 10; // Safety limit
        let iteration = 0;

        while (hasMore && iteration < maxIterations) {
            const queryParams = {
                limit: 100,
                type: 'charge',
                created: { gte: startDate },
                expand: ['data.source']
            };

            if (lastId) {
                queryParams.starting_after = lastId;
            }

            const transactions = await stripe.balanceTransactions.list(queryParams);
            
            allTransactions = allTransactions.concat(transactions.data);
            hasMore = transactions.has_more;
            
            if (transactions.data.length > 0) {
                lastId = transactions.data[transactions.data.length - 1].id;
            }
            
            iteration++;

            // If we have enough data, stop
            if (allTransactions.length >= parseInt(limit)) {
                break;
            }
        }

        // Also fetch BLIK payments (type: 'payment')
        let blikTransactions = [];
        hasMore = true;
        lastId = null;
        iteration = 0;

        while (hasMore && iteration < maxIterations) {
            const queryParams = {
                limit: 100,
                type: 'payment',
                created: { gte: startDate },
                expand: ['data.source']
            };

            if (lastId) {
                queryParams.starting_after = lastId;
            }

            try {
                const transactions = await stripe.balanceTransactions.list(queryParams);
                blikTransactions = blikTransactions.concat(transactions.data);
                hasMore = transactions.has_more;
                
                if (transactions.data.length > 0) {
                    lastId = transactions.data[transactions.data.length - 1].id;
                }
            } catch (e) {
                // Type 'payment' might not exist, skip
                hasMore = false;
            }
            
            iteration++;
        }

        // Combine all transactions
        allTransactions = allTransactions.concat(blikTransactions);

        // Sort by date (newest first)
        allTransactions.sort((a, b) => b.created - a.created);

        // Limit results
        if (allTransactions.length > parseInt(limit)) {
            allTransactions = allTransactions.slice(0, parseInt(limit));
        }

        // Transform to unified format (matching CSV structure)
        const unifiedData = allTransactions.map(tx => {
            const source = tx.source;
            const isObject = source && typeof source === 'object';
            
            // Get charge/payment details
            const chargeId = isObject ? source.id : source;
            const paymentIntentId = isObject ? (source.payment_intent || '') : '';
            const customerEmail = isObject ? (
                source.billing_details?.email || 
                source.receipt_email || 
                source.metadata?.email ||
                ''
            ) : '';
            
            // Payment method details
            const paymentMethod = isObject ? source.payment_method_details : null;
            const cardDetails = paymentMethod?.card || {};
            const paymentType = paymentMethod?.type || '';
            
            // Customer details
            const cardName = isObject ? (
                cardDetails.name ||
                source.billing_details?.name ||
                ''
            ) : '';

            // Determine status
            let status = 'Pending';
            if (isObject) {
                if (source.status === 'succeeded' || source.paid === true) {
                    status = 'Paid';
                } else if (source.status === 'failed') {
                    status = 'Failed';
                }
            }

            return {
                // Core identifiers
                id: chargeId,
                'PaymentIntent ID': paymentIntentId,
                
                // Transaction details
                'Created date (UTC)': new Date(tx.created * 1000).toISOString().replace('T', ' ').slice(0, 19),
                Amount: Math.abs(tx.amount / 100).toFixed(2),
                'Amount Refunded': '0.00', // Would need separate refund lookup
                Currency: tx.currency,
                Captured: isObject ? source.captured : true,
                'Converted Amount': Math.abs(tx.amount / 100).toFixed(2),
                'Converted Currency': tx.currency,
                
                // Fees
                Fee: (tx.fee / 100).toFixed(2),
                Net: (tx.net / 100).toFixed(2),
                
                // Status
                Status: status,
                'Seller Message': isObject && source.outcome ? source.outcome.seller_message : '',
                'Decline Reason': isObject ? (source.failure_code || '') : '',
                
                // Payout info (KEY FIELD for reconciliation!)
                Transfer: tx.payout || '',
                payout_id: tx.payout || '',
                payout_status: tx.payout ? 'paid' : 'pending',
                available_on: new Date(tx.available_on * 1000).toISOString().split('T')[0],
                
                // Customer info
                'Customer Email': customerEmail,
                'Card Name': cardName,
                
                // Payment method
                'Payment Source Type': paymentType,
                'Card Brand': cardDetails.brand || '',
                'Card Last4': cardDetails.last4 || '',
                'Card Funding': cardDetails.funding || '',
                'Card Issue Country': cardDetails.country || '',
                
                // Description
                Description: tx.description || '',
                
                // Mode
                Mode: 'Live'
            };
        });

        res.status(200).json({
            success: true,
            data: unifiedData,
            count: unifiedData.length,
            account: account,
            date_range: {
                from: new Date(startDate * 1000).toISOString().split('T')[0],
                to: new Date(now * 1000).toISOString().split('T')[0]
            },
            message: `Retrieved ${unifiedData.length} transactions from the last ${days} days`
        });

    } catch (error) {
        console.error('Stripe API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch unified Stripe data',
            message: error.message,
            type: error.type
        });
    }
};
