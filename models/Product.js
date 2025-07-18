const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String,
        default: ''
    },
    description: { 
        type: String,
        default: ''
    },
    inStock: {
        type: Boolean,
        default: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;