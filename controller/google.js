const express = require('express');
const router = express.Router();
const got = require('got');
const { verifyAccessToken, verifyAccessTokenCookie } = require('../helper/jwt');
const { body, validationResult } = require('express-validator');
const db = require('../model/connection');
const Google = db.google;
const FacebookPage = db.facebookPage;
const { textValidation } = require('../helper/validation');


router.post('/connection/app',
    verifyAccessToken,
    body('access_token').custom(async (value) => textValidation(value, 'access_token')),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            try {
                let { access_token, fbId, fbName } = req.body;
                let google = await Google.findAll({
                    attributes: ['id', 'userId'],
                    where: {
                        userId: req.payload.id,
                    }
                })
                if (google.length == 0) {
                    await Google.create({ userId: req.payload.id, token: access_token })
                } else {
                    await Google.update({ token: access_token }, {
                        where: {
                            userId: req.payload.id
                        }
                    })
                }
                return res.status(200).json({
                    message: 'google token stored successfully',
                });
            } catch (error) {
                console.log(error);
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }


    })


    router.get('/token/detail',
    verifyAccessToken,
    async (req, res) => {
        try {
            let google = await Google.findAll({
                where: {
                    userId: req.payload.id,
                }
            })
            if (google.length == 0) {
                return res.status(200).json({
                    message: 'No google token details available',
                    googleDetails:{}
                });
            } else {
                let googleDetails = await Google.findOne({
                    where: {
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Google token details recieved successfully',
                    googleDetails:googleDetails
                });
            }
            
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }


    })







    module.exports = router;