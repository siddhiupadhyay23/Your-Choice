const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    name: {
        type: String,
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Basket = mongoose.model('Basket', basketSchema);

module.exports = Basket;