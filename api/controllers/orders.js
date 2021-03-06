const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        quantity: doc.quantity,
                        product: doc.product,
                        request: {
                            type: 'GET',
                            url:'http://localhost:3000/orders/'+ doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if(!product){
                return res.status(404).json({
                    message:'Product not found'
                })
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity: req.body.quantity
            });
            return order.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order stored',
                createdOrder: {
                    product: result.product,
                    quantity: result.quantity,
                    _id: result._id,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/orders/'+ result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
exports.orders_get_by_id = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('quantity product _id')
        .populate('product')
        .exec()
        .then(doc => {
            if(doc) {
                res.status(200).json({
                    order: doc,
                    request: {
                        type: 'GET',
                        url:'http://localhost:3000/orders/'+ doc._id
                    }
                });
            } else {
                res.status(404).json({message: 'No valid entry found for provided Id'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}
exports.orders_delete_by_id = (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({_id: id})
        .exec()
        .then(result => {
            if(result.n) {
                res.status(200).json({
                    message: 'Order deleted'
                });
            } else {
                res.status(404).json({
                    message: 'Order with provided Id not found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

}