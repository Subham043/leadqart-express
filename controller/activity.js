const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const Groups = db.groups;
const Leads = db.leads;
const Activity = db.Activity;
const { textValidation, IDValidation, emptyTextValidation, emptyValidation } = require('../helper/validation');



// create group route.
router.post('/create/:leadId',
    //custom validations
    body('type').custom(async (value) => textValidation(value, 'type')),
    body('description').custom(async (value) => emptyValidation(value, 'description')),
    body('timestamp').custom(async (value) => emptyTextValidation(value, 'timestamp')),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { type, description, timestamp } = req.body;

            let lead = await Leads.findAll({
                attributes: ['id'],
                where: {
                    id: req.params.leadId,
                    userId: req.payload.id,
                }
            })
            if (lead.length == 0) {
                return res.status(200).json({
                    error: 'Invalid lead',
                });
            }

            try {
                await Activity.create({ type, description, timestamp, userId: req.payload.id, leadId:req.params.leadId })
                return res.status(200).json({
                    message: 'Activity stored successfully',
                });
            } catch (error) {
                console.log(error)
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// edit group route.
router.post('/edit/:id',
    verifyAccessToken,
    //custom validations
    body('type').custom(async (value) => textValidation(value, 'type')),
    body('description').custom(async (value) => emptyValidation(value, 'description')),
    body('timestamp').custom(async (value) => emptyTextValidation(value, 'timestamp')),
    
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { type, description, timestamp } = req.body;

            let lead = await Activity.findAll({
                attributes: ['id'],
                where: {
                    id: req.params.id,
                    userId: req.payload.id,
                }
            })
            if (lead.length == 0) {
                return res.status(200).json({
                    error: 'Invalid Activity',
                });
            }

            try {
                await Activity.update({ type, description, timestamp }, {
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Activity updated successfully',
                });
            } catch (error) {
                console.log(error);
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })


// delete group route.
router.delete('/delete/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'id')),
    check('id').custom(async (value, { req }) => {
        let group = await Activity.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (group.length == 0) {
            return Promise.reject('Invalid activity');
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
                await Activity.destroy({
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Activity deleted successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// read all groups route.
router.get('/view-all/:leadId',
    verifyAccessToken,
    async function (req, res) {
        try {
            let lead = await Leads.findAll({
                attributes: ['id'],
                where: {
                    id: req.params.leadId,
                    userId: req.payload.id,
                }
            })
            if (lead.length == 0) {
                return res.status(200).json({
                    error: 'Invalid Lead',
                });
            }

            let groups = await Activity.findAll({
                where: {
                    userId: req.payload.id,
                    leadId: req.params.leadId
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'type', 'description', 'timestamp', 'created_at'],
            })
            return res.status(200).json({
                message: 'Activity recieved successfully',
                groups
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

// read group route.
router.get('/view/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'id')),
    check('id').custom(async (value, { req }) => {
        let group = await Activity.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (group.length == 0) {
            return Promise.reject('Invalid Activity');
        }
    }),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        }
        try {
            let groups = await Activity.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'description', 'type', 'timestamp', 'created_at'],
            })
            return res.status(200).json({
                message: 'Activity recieved successfully',
                groups
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })


    
module.exports = router;
