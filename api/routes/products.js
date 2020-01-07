const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/'+ doc._id
                        }
                    }
                })
            };

           // if(doc.length >= 1) {
              res.status(200).json(response);
        //     } else{
        //         res.status(404).json({
        //             message: 'No entries found'
        //         });
        //     }
            })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
        console.log(result);
            res.status(201).json({
                message: 'Handling POST requests to /products',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+ result._id
                    }
                }
            });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log('From DB', doc);
            if(doc){
                res.status(200).json({
                    product:  doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+ doc._id
                    }
                });
            } else {
                res.status(404).json({message: 'No valid entry found for provided ID'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            if(result.n){
                res.status(200).json({
                    message: 'Product updated',
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+ id
                });
            } else {
                res.status(404).json({
                    message: 'Product with provided Id not found'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            if(result.n){
                res.status(200).json({
                    message: 'Product deleted'
                });
            } else {
                res.status(404).json({
                    message: 'Product with provided Id not found'
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;