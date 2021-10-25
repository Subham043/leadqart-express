const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const contentMessage = db.contentMessage;
const { textValidation, IDValidation } = require('../helper/validation');


// create follow-up route.
router.post('/create/',
    verifyAccessToken,
    //custom validations
    body('title').custom(async (value) => textValidation(value, 'title')),
    body('message').custom(async (value) => textValidation(value, 'message')),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { title, message } = req.body;

            try {
                await contentMessage.create({ title, message, userId: req.payload.id })
                return res.status(200).json({
                    message: 'content message stored successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// delete follow-up route.
router.delete('/delete/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'content message id')),
    check('id').custom(async (value, { req }) => {
        let lead = await contentMessage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content message');
        }
    }),
    
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {

            try {
                await contentMessage.destroy({
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'content message removed successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// edit follow up.
router.post('/edit/:id',
verifyAccessToken,
//custom validations
    check('id').custom(async (value) => IDValidation(value, 'follow up id')),
    check('id').custom(async (value, { req }) => {
        let lead = await contentMessage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content message');
        }
    }),
    body('title').custom(async (value) => textValidation(value, 'title')),
    body('message').custom(async (value) => textValidation(value, 'message')),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.mapped(),
        });
    } else {
        let { title, message } = req.body;
        try {
            let updateData = await contentMessage.update({ title, message }, {
                where: {
                    id: req.params.id,
                    userId: req.payload.id,
                }
            })
            return res.status(200).json({
                message: 'content message updated successfully',
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Oops!! Something went wrong please try again.',
            });
        }
        
        
    }

})









module.exports = router;