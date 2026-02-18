const { timeStamp } = require('console');
const { Currency } = require('lucide-react');
const mongoose = require('mongoose');
const { type } = require('os');

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Account must to be associated with a user'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'suspended'],
            message: 'Status must be either active, inactive, or suspended', 
        },
        default: 'active'   
    },
    Currency:{
        type: String,
        required: [true, 'Currency is required'],
        default: 'INR'
    },
},
{
    timestamps: true
})

accountSchema.index({ user: 1,status: 1 },{unique: true, partialFilterExpression: { status: 'active' } });

const accountModel = mongoose.model('account', accountSchema);

module.exports = accountModel; 