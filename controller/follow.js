const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const Leads = db.leads;
const followUp = db.followUp;
const { textValidation, IDValidation, emptyTextValidation } = require('../helper/validation');


// create follow-up route.
router.post('/create/:leadId',
    verifyAccessToken,
    //custom validations
    body('type').custom(async (value) => textValidation(value, 'type')),
    body('description').custom(async (value) => emptyTextValidation(value, 'description')),
    body('timestamp').custom(async (value) => emptyTextValidation(value, 'timestamp')),
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
            let { type, description, timestamp } = req.body;

            try {
                await followUp.destroy({
                    where: {
                        leadId: req.params.leadId,
                    }
                })
                await followUp.create({ type, description, timestamp, userId: req.payload.id, leadId: req.params.leadId })
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
    body('description').custom(async (value) => emptyTextValidation(value, 'description')),
    body('timestamp').custom(async (value) => emptyTextValidation(value, 'timestamp')),
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.mapped(),
        });
    } else {
        let { type, description, timestamp } = req.body;
        try {
            let updateData = await followUp.update({ type, description, timestamp }, {
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


// read all groups route.
router.get('/view-via-lead/:leadId',
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

            let groups = await followUp.findOne({
                where: {
                    userId: req.payload.id,
                    leadId: req.params.leadId
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Follow Up recieved successfully',
                followUps:groups
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

    router.get('/get-someday-count',
    verifyAccessToken,
    async function (req, res) {
        try {

            let groups = await followUp.findAll({
                where: {
                    userId: req.payload.id,
                    type: 'SOMEDAY'
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Follow Up count recieved successfully',
                count:groups.length
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

    router.get('/get-today-count',
    verifyAccessToken,
    async function (req, res) {
        try {
            const TODAY_START = new Date().setHours(0, 0, 0, 0);
            const NOW = new Date();
            let groups = await followUp.findAll({
                where: {
                    userId: req.payload.id,
                    timestamp: { 
                        [Op.gt]: TODAY_START,
                        [Op.lt]: NOW
                    },
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Follow Up count recieved successfully',
                count:groups.length
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })


    router.get('/get-overdue-count',
    verifyAccessToken,
    async function (req, res) {
        try {
            const NOW = new Date();
            let groups = await followUp.findAll({
                where: {
                    userId: req.payload.id,
                    timestamp: { 
                        [Op.lt]: NOW
                    },
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Follow Up count recieved successfully',
                count:groups.length
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

    router.get('/get-overdue',
    verifyAccessToken,
    async function (req, res) {
        try {
            const NOW = new Date();
            let groups = await followUp.findAll({
                where: {
                    userId: req.payload.id,
                    timestamp: { 
                        [Op.lt]: NOW
                    },
                },
                order: [
                    ['id', 'DESC'],
                ],
                include: [
                    {
                      model: Leads,
                      attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo'],
                    },
                ],
            })
            console.log(groups);
            return res.status(200).json({
                message: 'Follow Up count recieved successfully',
                count:groups
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })


    router.get('/get-upcoming-count',
    verifyAccessToken,
    async function (req, res) {
        try {
            const NOW = new Date();
            let groups = await followUp.findAll({
                where: {
                    userId: req.payload.id,
                    timestamp: { 
                        [Op.gt]: NOW
                    },
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Follow Up count recieved successfully',
                count:groups.length
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })








module.exports = router;