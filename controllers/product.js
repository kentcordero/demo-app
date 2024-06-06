const Product = require('../models/Product');

module.exports.createProduct = (req, res) => {
    return Product.findOne({ name: req.body.name }).then(existingProduct => {
        let newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        });

        if (existingProduct) {
            return res.status(409).send({ error: 'Product already exists' });
        }

        return newProduct.save().then(product => res.status(201).send({ product })).catch(saveError => {
            console.error('Error in saving the product: ', saveError);
            res.status(500).send({ error: 'Failed to save the product' });
        });
    }).catch(findError => {
        console.error('Error in finding the product: ', findError);
        return res.status(500).send({ message: "Error in finding the product" });
    });
};

module.exports.retrieveAllProduct = async (req, res) => {
    try {
        const products = await Product.find();
        res.send({ products });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
};

module.exports.activeProduct = (req, res) => {
Product.find({ isActive: true })
    .then((products) => {
    if (products.length > 0) {
        return res.status(200).send({ products });
    } else {
        return res.status(200).send({ message: "No active products found." });
    }
    })
    .catch((findErr) => {
    console.error('Error finding active products: ', findErr);
    return res.status(500).send({ error: 'Error finding active products' });
    });
};


module.exports.retrieveSingleProduct = async (req, res) => {
try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
    return res.status(404).send({ error: 'Product not found' });
    }

    res.send({ product });
} catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
}
};

module.exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const updatedData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        };

        const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, {
            new: true,
        });

        if (!updatedProduct) {
            return res.status(404).send({ error: 'Product not found' });
        }

        res.send({
            message: 'Product updated successfully',
            updatedProduct: updatedProduct,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
};

module.exports.archiveProduct = (req, res) => {
    let archivedProduct = {
        isActive: false
    };

    return Product.findByIdAndUpdate(req.params.productId, archivedProduct, { new: true })
        .then(archiveProduct => {
            if (archiveProduct) {

                return res.status(200).send({ message: 'Product archived successfully', archiveProduct });

            } else {

                return res.status(404).send({ error: 'Product not found' });
            }

        }).catch(findErr => {
      
            console.error('Failed to archive Product: ', findErr);
      
            return res.status(500).send({ error: 'Failed to archive Product' });
    
    });
};

module.exports.activateProduct = (req, res) => {
        let activatedProduct = {
        isActive: true
    };

    return Product.findByIdAndUpdate(req.params.productId, activatedProduct)
        .then(activateProduct => {
        if (activateProduct) {
        return res.status(200).send({ message: 'Product activated successfully', activateProduct });
    } else {
        return res.status(404).send({ error: 'Product not found' });
    }
    }).catch(findErr => {

    console.error('Failed to activating a Product: ', findErr);

    return res.status(500).send({ error: 'Failed to activating a Product' });
    });
};

module.exports.searchProductByName = async (req, res) => {
    try {
        const { productName } = req.body;
    
        const products = await Product.find({
        name: { $regex: productName, $options: 'i' }
        });
    
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    };
    
    module.exports.searchProductByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;
    
        const products = await Product.find({
        price: { $gte: minPrice, $lte: maxPrice },
        });
    
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    };