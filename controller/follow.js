const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const Leads = db.leads;
const followUp = db.followUp;
const { textValidation, IDValidation } = require('../helper/validation');


// create follow-up route.
router.post('/create/:leadId',
    verifyAccessToken,
    //custom validations
    body('type').custom(async (value) => textValidation(value, 'type')),
    body('description').custom(async (value) => textValidation(value, 'description')),
    body('date').custom(async (value) => textValidation(value, 'date')),
    body('time').custom(async (value) => textValidation(value, 'time')),
    check('leadId').custom(async (value, { req }) => {
        try {
            let lead = await Leads.findAll({
                attributes: ['id'],
                where: {
                    id: value,
                    userId: req.payload.id,
                }
            })
            if (lead.length == 0) {
                return Promise.reject('Invalid lead');
            }
        } catch (error) {
            console.log(error)
        }

    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { type, description, date, time } = req.body;

            try {
                await followUp.create({ type, description, date, time, userId: req.payload.id, leadId: req.params.leadId })
                return res.status(200).json({
                    message: 'follow up stored successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// delete follow-up route.
router.delete('/delete/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'follow up id')),
    check('id').custom(async (value, { req }) => {
        let lead = await followUp.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid follow up');
        }
    }),
    
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {

            try {
                await followUp.destroy({
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'follow up removed successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
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
        let lead = await followUp.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid follow up');
        }
    }),
    body('type').custom(async (value) => textValidation(value, 'type')),
    body('description').custom(async (value) => textValidation(value, 'description')),
    body('date').custom(async (value) => textValidation(value, 'date')),
    body('time').custom(async (value) => textValidation(value, 'time')),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.mapped(),
        });
    } else {
        let { type, description, date, time } = req.body;
        try {
            let updateData = await followUp.update({ type, description, date, time }, {
                where: {
                    id: req.params.id,
                    userId: req.payload.id,
                }
            })
            return res.status(200).json({
                message: 'follow up updated successfully',
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }
        
        
    }

})









module.exports = router;