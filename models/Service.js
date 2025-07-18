const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    available: {
        type: Boolean,
        default: true
    }
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;