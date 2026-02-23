const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service'); 
const mongoose = require('mongoose');


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

    /**
     * 1.Validate Request 
     */

    const fromUserAccount = await accountModel.findOne({ 
        _id: fromAccount
    });
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });
    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: 'One or both accounts not found'
        })
    }

        /**
         * 2.validate idempotency key
         */

        const isTransactionAlraedyExists = await transactionModel.findOne({
            idempotencyKey:idempotencyKey
        })

        if (isTransactionAlraedyExists) {
            if(isTransactionAlraedyExists.status === "completed") {
                return res.status(200).json({
                    message: 'Transaction already completed',
                    transaction: isTransactionAlraedyExists
                })
            }
            
            if(isTransactionAlraedyExists.status === "pending") {
                return res.status(200).json({
                    message: 'Transaction is still pending'
                })
            }

            if(isTransactionAlraedyExists.status === "failed") {
                return res.status(500).json({
                    message: 'Transaction already failed',
            
                })
            }

            if(isTransactionAlraedyExists.status === "reversed") {
                return res.status(500).json({
                    message: 'Transaction was reversed'
                })
            }
        }

        /**
         * 3.check account status
         */

        if(fromUserAccount.status !== "active" || toUserAccount.status !== "active") {
            return res.status(400).json({
                message:"Both accounts must be active to perform transaction"
            })
        }

        /**
         * 4.Derive sender balance from ledger
         */

          const balance = await fromUserAccount.getBalance();

          if(balance < amount) {
            return res.status(400).json({
                message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
            })
          }

          /**
           * 5.Create transaction with pending status
           */

          const session = await mongoose.startSession();
            session.startTransaction();

        const transaction = await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'pending'
         }, { session })
       
         const debitEntry = await ledgerModel.create({
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: 'debit'
         }, { session })
        
         const creditEntry = await ledgerModel.create({
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: 'credit'
         }, { session })

         transaction.status = 'completed';
            await transaction.save({ session }); 

            await session.commitTransaction();
            session.endSession();

            /**
             * 10.Send email notifications
             */

          await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, fromUserAccount._id, toUserAccount._id, transaction._id);

          return res.status(201).json({
            message: 'Transaction completed successfully',
          })

}

async function createInitialFundTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if( !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'Missing required fields: toAccount, amount, idempotencyKey'
        })
    }

        const toUserAccount = await accountModel.findOne({
             _id: toAccount
        })
        if (!toUserAccount) {
            return res.status(404).json({
                message: 'Destination account not found'
            })
        }
}

module.exports = {
    createTransaction,
    createInitialFundTransaction
}