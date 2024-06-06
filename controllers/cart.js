const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const mongoose = require('mongoose');

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop]
    }
    return total
};

module.exports.getUserCart = (req, res) => {
    Cart.findOne({ userId: req.body.userId }).then(async cart => {
        const user = await User.findById(req.body.userId).then(user => user);
        if (!user) return res.status(404).send({ error: 'User not found'});
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        } else {
            return res.status(200).send({cart});
        }
    }).catch(error => {
        console.error('Error fetching user profile: ', error);
        return res.status(500).send({ error: 'Failed to fetch user profile' });
    })
};

module.exports.addToCart = (req, res) => {
    if (!req.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    const productId = req.body.productId;
    const quantity = req.body.quantity ?? 1;

    Product.findById(productId).then(product => {
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        return User.findById(req.user.id).then(user => {
            return {
                user,
                product
            };
        });
    }).then(async userAndProduct => {
        const { user, product } = userAndProduct
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        const cartItem = {
            productId,
            quantity,
            subtotal: product.price * quantity,
        };

        const isCartAlreadyExisting = await Cart.findOne({ userId: req.user.id }).then(cart => cart);
        let cartData;
        if (isCartAlreadyExisting) {
            cartData = isCartAlreadyExisting;
            const item = cartData.cartItems.find((item) => item.productId == productId)
            if (item) {
                item.quantity += quantity;
                item.subtotal = product.price * item.quantity;
            } else {
                cartData.cartItems.push(cartItem);
            }
            cartData.totalPrice = cartData.cartItems?.sum('subtotal') ?? 0;
            cartData.save();
        } else {
            cartData = await new Cart({
                userId: user._id,
                cartItems: [cartItem],
                totalPrice: cartItem.subtotal,
            }).save();
        }

        return res.status(201).send({
            message: 'Item added to cart successfully',
            cart: cartData,
        });
    }).catch(error => {
        console.error('Error adding item to cart: ', error);
        return res.status(500).send({ error: 'Failed to add item to cart' });
    });
};

module.exports.changeProductQuantity = async (req, res) => {

try {
    const { itemId, quantity } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: 'User not found' });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).send({ error: 'Cart not found' });

    const cartItem = cart.cartItems?.find(item => item._id == itemId);
    if (!cartItem) return res.status(404).send({ error: 'Cart item not found' });

    const product = await Product.findById(cartItem.productId);
    if (!product) return res.status(404).send({ error: 'Product not found' });

    cartItem.quantity = quantity;
    cartItem.subtotal = product.price * quantity;
    cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
    await cart.save();

    return res.status(200).send({ message: 'Item quantity updated successfully', updatedCart: cart });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: 'Server error' });
  }
};

module.exports.removeProductFromCart = async (req, res) => {
try {
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId: req.user.id }).then(cart => cart);

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    const itemIndex = cart.cartItems?.findIndex(product => product.productId == productId);

    if (itemIndex === -1) {
        return res.status(404).send({ error: 'Item not found in cart' });
    }

    cart.cartItems.splice(itemIndex, 1);
    cart.totalPrice = cart.cartItems?.sum('subtotal') ?? 0;
    cart.save();

    res.send({ message: 'Item removed from cart successfully', updatedCart: cart });
} catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
}
};

module.exports.clearCart = async (req, res) => {
try {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }

    if (!user.isAdmin) {
        return res.status(403).send({ error: 'Access denied.' });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).then(cart => cart);

    if (cart.cartItems.length) {
        cart.cartItems = [];
        cart.totalPrice = cart.cartItems?.sum('subtotal') ?? 0;
        await cart.save();
    } else {
        return res.status(404).send({ error: 'No items to clear.' });
    }

    res.send({ message: 'Cart cleared successfully', updatedCart: cart });
} catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
}
};
