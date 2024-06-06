const Order = require('../models/Order');
const Cart = require('../models/Cart');

module.exports.createOrder = async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    await Cart.findOne({ userId: req.user.id }).then(async cart => {
        if (!cart) {
            return res.status(404).send({ error: 'No cart found for this user' });
        }

        if (!cart.cartItems || cart.cartItems.length === 0) {
            return res.status(404).send({ error: 'No Items to Checkout' });
        }

        const orderData = {
            userId: req.user.id,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice
        };

        try {
            const newOrder = new Order(orderData);
            await newOrder.save();

            cart.cartItems = [];
            cart.totalPrice = 0;
            await cart.save();

            return res.status(201).send({ message: 'Ordered Successfully', order: newOrder });
        } catch (error) {
            console.error('Error creating order: ', error);
            return res.status(404).send({ error: 'Failed to order', details: error });
        }
    }).catch(error => {
        console.error('Error finding cart: ', error);
        return res.status(500).send({ error: 'Failed to find cart', details: error });
    });
};

module.exports.retrieveUserOrders = (req, res) => {
    if (!req.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    Order.find({ userId: req.user.id }).then(orders => {
        if (!orders || orders.length === 0) {
            return res.status(404).send({ message: 'No orders found for this user' });
        } else {
            return res.status(200).send({ orders });
        }
    }).catch(error => {
        console.error('Error finding orders: ', error);
        return res.status(500).send({ error: 'Failed to find orders', details: error });
    });
};

module.exports.retrieveAllOrders = async (req, res) => {
    if (!req.user) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    if (!req.user.isAdmin) {
        return res.status(403).send({ error: 'Forbidden' });
    }

    await Order.find({}).then(orders => {
        if (!orders || orders.length === 0) {
            return res.status(404).send({ message: 'No orders found' });
        } else {
            return res.status(200).send({ orders });
        }
    }).catch(error => {
        console.error('Error finding orders: ', error);
        return res.status(500).send({ error: 'Failed to find orders', details: error });
    });
};