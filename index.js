const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

const app = express();

const port = 4007;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect('mongodb+srv://admin:admin1234@kentdb.4oxbo78.mongodb.net/Demo-App?retryWrites=true&w=majority&appName=kentDB');

let db = mongoose.connection;


db.on('error', console.error.bind(console, 'connection error'));

db.once('open', () => console.log(`We're connected to MongoDB Atlas`));

app.use('/b7/users', userRoutes);
app.use('/b7/products', productRoutes);
app.use('/b7/cart', cartRoutes);
app.use('/b7/orders', orderRoutes);


if(require.main === module) {
    app.listen(process.env.PORT || port, () => console.log(`API is now online on port ${process.env.PORT || port}`))

}

module.exports = { app, mongoose };