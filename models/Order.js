const mongoose = require('mongoose');

const productsOrderedSchema = new mongoose.Schema({
    productId: {
        type: mongoose.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required']
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required']
    }
});

const orderSchema = new mongoose.Schema({

	userId: {
        type: mongoose.ObjectId,
        ref: 'User',
    },
    productsOrdered: {
        type: [productsOrderedSchema],
        default: undefined,
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required']
    },
    orderedOn: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 'Pending'
    }
    
});

module.exports = mongoose.model('Order', orderSchema);