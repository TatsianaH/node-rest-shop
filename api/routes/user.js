const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1) {
                return res.status(409).json({
                    message: 'User with this e-mail exists'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created',
                                    payload: {
                                        email: result.email,
                                        _id: result._id
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            });
                    }
                });
            }
        });
});

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then( user => {
            if(user.length < 1){
                return res.status(401).json({
                    message: 'Auth failed. Number of users is less than 1'
                });
            }
            bcrypt.compare(req.body.password, user[0].password,  (err, result) => {
                if(err){
                    return res.status(401).json({
                        message: 'Auth failed.'
                    })
                }
                if(result){
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                        );
                    return res.status(200).json({
                        message: 'Auth successful',
                        payload: {
                            email: user[0].email,
                            userId: user[0]._id,
                            token: token,
                        }
                    });
                }
                res.status(401).json({
                    message: 'Auth failed. Password'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
router.delete('/:userId', (req, res, next) => {
    User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            console.log(result);
            if(!result.n){
                res.status(404).json({
                    message: 'User with provided id not found'
                })
            } else {
                console.log(result);
                res.status(200).json({
                    message: 'User deleted'
                })
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;