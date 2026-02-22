const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must have a source account'],
        index: true
    },
    toAccount:{
         type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must have a destination account'],
        index: true

    },
    status:{
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed','reversed'],
            message: 'Status must be either pending, completed, failed or reversed',
        },
        default: 'pending'
    },
    amount:{
        type: Number,
        required: [true, 'Transaction amount is required'],
        min: [0, 'Transaction amount must be at least 0.01']
    },
    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required for transaction'],
        index: true,
        unique: true
    }  
},{
    timestamps: true 
})

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;
