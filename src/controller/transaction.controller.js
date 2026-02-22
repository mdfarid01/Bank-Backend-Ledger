const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service'); 


/**
 * - Create a new transaction
 * The 10-Step Transaction Creation Process:
    * 1.Validate Request
    * 2.validate idempotency key
    * 3.check account status
    * 4.Derive sender balance from ledger
    * 5.Create transaction with pending status
    * 6.Create debit ledger entry
    * 7.Create credit ledger entry
    * 8.Mark transaction as completed
    * 9.Commit mongodb session
    * 10.Send email notifications
 */

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        res.status(400).json({
            message: 'Missing required fields: fromAccount, toAccount, amount, idempotencyKey'
        })
    }

}