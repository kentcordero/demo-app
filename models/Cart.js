const mongoose = require('mongoose');

const cartItemsSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cartItems: {
    type: [cartItemsSchema],
    default: undefined,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
  },
  orderedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cart', cartSchema);