const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const Groups = db.groups;
const Leads = db.leads;
const { textValidation, IDValidation } = require('../helper/validation');



// create group route.
router.post('/create',
    //custom validations
    body('name').custom(async (value) => textValidation(value, 'name')),
    body('color').custom(async (value) => textValidation(value, 'color')),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { name, color } = req.body;

            try {
                await Groups.create({ name, color, userId: req.payload.id })
                return res.status(200).json({
                    message: 'Group stored successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// edit group route.
router.put('/edit/:id',
    verifyAccessToken,
    //custom validations
    body('name').custom(async (value) => textValidation(value, 'name')),
    body('color').custom(async (value) => textValidation(value, 'color')),
    check('id').custom(async (value) => IDValidation(value, 'id')),
    check('id').custom(async (value, { req }) => {
        let group = await Groups.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (group.length == 0) {
            return Promise.reject('Invalid group');
        }
    }),
    
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { name, color } = req.body;

            try {
                await Groups.update({ name, color }, {
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Group updated successfully',
                });
            } catch (error) {
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
        let group = await Groups.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (group.length == 0) {
            return Promise.reject('Invalid group');
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
                await Groups.destroy({
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Group deleted successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// read all groups route.
router.get('/view-all',
    verifyAccessToken,
    async function (req, res) {
        try {
            let groups = await Groups.findAll({
                where: {
                    userId: req.payload.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'name', 'color'],
                include: [
                    {
                      model: Leads,
                      as: "leads",
                      attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo'],
                    },
                ],
            })
            return res.status(200).json({
                message: 'Group recieved successfully',
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
        let group = await Groups.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (group.length == 0) {
            return Promise.reject('Invalid group');
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
            let groups = await Groups.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'name', 'color'],
                include: [
                    {
                      model: Leads,
                      as: "leads",
                      attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo'],
                    },
                ],
            })
            return res.status(200).json({
                message: 'Group recieved successfully',
                groups
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })


    
module.exports = router;
