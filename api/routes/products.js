const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsControllers = require('../controllers/products');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
   destination: function(req, file, callback){
callback(null, './uploads/');
   },
    filename: function(req, file, callback){
callback(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, callback) => {
    //store a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        // reject a file
        callback(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/', ProductsControllers.products_get_all);

router.post('/', checkAuth, upload.single('productImage'), ProductsControllers.products_create_product);

router.get('/:productId', ProductsControllers.products_get_by_id);

router.patch('/:productId', checkAuth, ProductsControllers.products_update_product_by_id);

router.delete('/:productId', checkAuth, ProductsControllers.products_delete_product_by_id);


module.exports = router;