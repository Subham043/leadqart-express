const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Groups = db.groups;
const Leads = db.leads;
const LeadsGroups = db.leadsGroups;
const { textValidation, IDValidation } = require('../helper/validation');


// create lead-group route.
router.post('/create',
    verifyAccessToken,
    //custom validations
    body('input').custom(async (value, { req }) => {
        if (value.length == 0) {
            return Promise.reject('Please enter the valid inputs');
        }
    }),
    body('input.*.lead_id').custom(async (value) => textValidation(value, 'lead_id')),
    body('input.*.lead_id').custom(async (value, { req }) => {
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
    body('input.*.group_id').custom(async (value) => textValidation(value, 'group_id')),
    body('input.*.group_id').custom(async (value, { req }) => {
        try {
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
            let { input } = req.body;

            try {
                let error = [];
                input.forEach(async (input) => {
                    try {
                        await LeadsGroups.create(input);
                    } catch (error) {
                        console.log(error);
                    }
                })
                return res.status(200).json({
                    message: 'Lead added to group successfully',
                });
            } catch (error) {
                console.log(error);
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

// delete lead from the group route.
router.delete('/delete/:leadId/:groupId',
    verifyAccessToken,
    //custom validations
    check('leadId').custom(async (value) => IDValidation(value, 'lead id')),
    check('leadId').custom(async (value, { req }) => {
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
    check('groupId').custom(async (value) => IDValidation(value, 'group id')),
    check('groupId').custom(async (value, { req }) => {
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
    check('leadId').custom(async (value, { req }) => {
        let leadg = await LeadsGroups.findAll({
            attributes: ['id'],
            where: {
                lead_id: value,
                group_id: req.params.groupId,
            }
        })
        if (leadg.length == 0) {
            return Promise.reject('This lead does not belong to the given group id');
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
                await LeadsGroups.destroy({
                    where: {
                        lead_id: req.params.leadId,
                        group_id: req.params.groupId,
                    }
                })
                return res.status(200).json({
                    message: 'Lead removed successfully from group',
                });
            } catch (error) {
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })









module.exports = router;