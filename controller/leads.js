const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const Leads = db.leads;
const Groups = db.groups;
const followUp = db.followUp;
const Activity = db.Activity;
const { textValidation, phoneValidation, IDValidation, emptyTextValidation } = require('../helper/validation');

// create lead route.
router.post('/create',
    //custom validations
    body('leads.*.leadSource').custom(async (value) => emptyTextValidation(value, 'leadSource')),
    body('leads.*.facebookPage').custom(async (value) => emptyTextValidation(value, 'facebookPage')),
    body('leads.*.campaign').custom(async (value) => emptyTextValidation(value, 'campaign')),
    body('leads.*.adset').custom(async (value) => emptyTextValidation(value, 'adset')),
    body('leads.*.ad').custom(async (value) => emptyTextValidation(value, 'ad')),
    body('leads.*.formName').custom(async (value) => emptyTextValidation(value, 'formName')),
    body('leads.*.job').custom(async (value) => emptyTextValidation(value, 'job')),
    //custom validation for phone
    body('leads.*.phone').custom(async (value) => emptyTextValidation(value)),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
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
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// edit lead route.
router.put('/edit/:id',
    //custom validations
    body('leadSource').custom(async (value) => emptyTextValidation(value, 'leadSource')),
    body('facebookPage').custom(async (value) => emptyTextValidation(value, 'facebookPage')),
    body('campaign').custom(async (value) => emptyTextValidation(value, 'campaign')),
    body('adset').custom(async (value) => emptyTextValidation(value, 'adset')),
    body('ad').custom(async (value) => emptyTextValidation(value, 'ad')),
    body('formName').custom(async (value) => emptyTextValidation(value, 'formName')),
    body('job').custom(async (value) => emptyTextValidation(value, 'job')),
    body('notes').custom(async (value) => emptyTextValidation(value, 'notes')),
    //custom validation for phone
    body('phone').custom(async (value) => emptyTextValidation(value)),
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
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { leadSource, facebookPage, campaign, adset, ad, formName, job, phone, notes } = req.body;

            try {
                await Leads.update({ leadSource, facebookPage, campaign, adset, ad, formName, job, phone, notes }, {
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Lead updated successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// edit lead note route.
router.post('/edit-note/:id',
    //custom validations
    body('notes').custom(async (value) => emptyTextValidation(value, 'notes')),
    verifyAccessToken,
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { notes } = req.body;

            let lead = await Leads.findAll({
                attributes: ['id'],
                where: {
                    id: req.params.id,
                    userId: req.payload.id,
                }
            })
            if (lead.length == 0) {
                return res.status(200).json({
                    error: 'Invalid lead',
                });
            }

            try {
                await Leads.update({ notes }, {
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Notes updated successfully',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
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
            return res.status(200).json({
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
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
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
                attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo', 'notes', 'created_at'],
                include: [
                    {
                        model: Groups,
                        as: "groups",
                        attributes: ['id', 'name'],
                    },
                ],
            })
            return res.status(200).json({
                message: 'Lead recieved successfully',
                leads
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        }
        try {
            let leads = await Leads.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo', 'notes', 'created_at'],
                include: [
                    {
                        model: Groups,
                        as: "groups",
                        attributes: ['id', 'name'],
                    },
                ],
            })
            return res.status(200).json({
                message: 'Lead recieved successfully',
                leads
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

module.exports = router;
