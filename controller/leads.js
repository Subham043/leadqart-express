const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const Leads = db.leads;
const { textValidation, phoneValidation, IDValidation } = require('../helper/validation');

// create lead route.
router.post('/create',
    //custom validations
    body('leads.*.leadSource').custom(async (value) => textValidation(value, 'leadSource')),
    body('leads.*.facebookPage').custom(async (value) => textValidation(value, 'facebookPage')),
    body('leads.*.campaign').custom(async (value) => textValidation(value, 'campaign')),
    body('leads.*.adset').custom(async (value) => textValidation(value, 'adset')),
    body('leads.*.ad').custom(async (value) => textValidation(value, 'ad')),
    body('leads.*.formName').custom(async (value) => textValidation(value, 'formName')),
    body('leads.*.job').custom(async (value) => textValidation(value, 'job')),
    //custom validation for phone
    body('leads.*.phone').custom(async (value) => phoneValidation(value)),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { leads } = req.body;

            try {
                leads.forEach(async (lead) => {
                    await Leads.create({ ...lead, userId: req.payload.id })
                })
                return res.status(200).json({
                    message: 'Leads stored successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// edit lead route.
router.put('/edit/:id',
    //custom validations
    body('leadSource').custom(async (value) => textValidation(value, 'leadSource')),
    body('facebookPage').custom(async (value) => textValidation(value, 'facebookPage')),
    body('campaign').custom(async (value) => textValidation(value, 'campaign')),
    body('adset').custom(async (value) => textValidation(value, 'adset')),
    body('ad').custom(async (value) => textValidation(value, 'ad')),
    body('formName').custom(async (value) => textValidation(value, 'formName')),
    body('job').custom(async (value) => textValidation(value, 'job')),
    //custom validation for phone
    body('phone').custom(async (value) => phoneValidation(value)),
    check('id').custom(async (value) => IDValidation(value, 'id')),
    check('id').custom(async (value , { req }) => {
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
    }),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { leadSource, facebookPage, campaign, adset, ad, formName, job, phone } = req.body;

            try {
                await Leads.update({ leadSource, facebookPage, campaign, adset, ad, formName, job, phone }, {
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Lead updated successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// delete lead route.
router.delete('/delete/:id',
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'id')),
    check('id').custom(async (value, { req }) => {
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
    }),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {

            try {
                await Leads.destroy({
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Lead deleted successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// read all lead route.
router.get('/view-all',
    verifyAccessToken,
    async function (req, res) {
        try {
            let leads = await Leads.findAll({
                where: {
                    userId: req.payload.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead']
            })
            return res.status(200).json({
                message: 'Lead recieved successfully',
                leads
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Oops!! Something went wrong please try again.',
            });
        }

    })


// read lead route.
router.get('/view/:id',
    verifyAccessToken,
    //custom validations
    check('id').custom(async (value) => IDValidation(value, 'id')),
    check('id').custom(async (value, { req }) => {
        let lead = await Leads.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid lead id');
        }
    }),
    async function (req, res) {
        try {
            let leads = await Leads.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead']
            })
            return res.status(200).json({
                message: 'Lead recieved successfully',
                leads
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Oops!! Something went wrong please try again.',
            });
        }

    })

module.exports = router;