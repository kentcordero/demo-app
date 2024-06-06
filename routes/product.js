const express = require('express');
const productController = require('../controllers/product');
const router = express.Router();
const { verify, verifyAdmin } = require('../auth');

router.post('/', verify, verifyAdmin, productController.createProduct);
router.get('/all', verify, verifyAdmin, productController.retrieveAllProduct);
router.get('/active', productController.activeProduct);
router.get('/:productId', verify, productController.retrieveSingleProduct);
router.patch('/:productId/update', verify, verifyAdmin, productController.updateProduct);
router.patch('/:productId/archive', verify, verifyAdmin, productController.archiveProduct);
router.patch('/:productId/activate', verify, verifyAdmin, productController.activateProduct);
router.post('/search-by-name', verify, productController.searchProductByName);
router.post('/search-by-price', verify, productController.searchProductByPrice);

module.exports = router;