const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const db = require('../model/connection');
const Users = db.users;
const Team = db.team;
const Leads = db.leads;
const AssignedLeads = db.assignedLeads;
const { body, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helper/jwt');
const { encrypt, decrypt } = require('../helper/crypt');
const { syncMail, asyncMail } = require('../helper/mail');
const { AuthLimiter } = require('../middleware/rate-limiter');
const { nameValidation, phoneValidation, emailValidation, passwordValidation, cpasswordValidation, otpValidation, textValidation } = require('../helper/validation');
const { verifyAccessToken } = require('../helper/jwt');


    router.post('/invite',
    verifyAccessToken,
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { email } = req.body;
            try {
                let user = await Users.findAll({
                    attributes: ['id', 'email', 'password'],
                    where: {
                        email: email,
                    }
                });

                if (user.length > 0) {
                    return res.status(200).json({
                        message: 'The email address is already in use',
                    });

                } else {
                    let otp = (Math.floor(100000 + Math.random() * 900000));
                    let userData = await Users.create({ email, otp, userType:1 })
                    await Team.create({ teamId:req.payload.id, memberId:userData.dataValues.id })
                    let leader = await Users.findOne({
                        attributes: ['id', 'email'],
                        where: {
                            id: req.payload.id,
                        }
                    });
                    await asyncMail(email, 'Leadqart invitation', `<h3>You have been invited to join leadqart by ${leader.dataValues.email}</h3><br>`);
                    
                    return res.status(200).json({
                        message: 'Invited successfully',
                    });
                }

            } catch (error) {
                console.log(error)
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
        let leads = await Team.findAll({
            where: {
                teamId: req.payload.id
            },
            order: [
                ['id', 'DESC'],
            ],
            include: [
                {
                    model: Users,
                    attributes: ['id', 'email']
                },
            ],
        })
        return res.status(200).json({
            message: 'Team recieved successfully',
            teams:leads
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            error: 'Oops!! Something went wrong please try again.',
        });
    }

})


// create lead route.
router.post('/assign/leads/:userId',
    //custom validations
    body('leads.*.id').custom(async (value) => textValidation(value, 'id')),
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
                let user = await Users.findAll({
                    attributes: ['id', 'email'],
                    where: {
                        id: req.params.userId,
                        userType:1
                    }
                });

                if (user.length == 0) {
                    return res.status(200).json({
                        error: 'Invalid member id',
                    });

                }

                let team = await Team.findAll({
                    where: {
                        teamId:req.payload.id, 
                        memberId: req.params.userId,
                    }
                });

                if (team.length == 0) {
                    return res.status(200).json({
                        error: 'Invalid member id',
                    });

                }

                leads.forEach(async (lead) => {
                    // await Leads.create({ ...lead, userId: req.payload.id })

                    let leadDetails = await Leads.findOne({
                        where: {
                            id: lead.id,
                            userId: req.payload.id,
                        }
                    })
                    // console.log(leadDetails!=null? leadDetails.dataValues : "empty")
                    if(leadDetails!=null){
                        let leadCheck = await Leads.findOne({
                            where: {
                                leadSource:leadDetails.dataValues.leadSource,
                                facebookPage:leadDetails.dataValues.facebookPage,
                                campaign:leadDetails.dataValues.campaign,
                                adset:leadDetails.dataValues.adset,
                                ad:leadDetails.dataValues.ad,
                                formName:leadDetails.dataValues.formName,
                                name:leadDetails.dataValues.name,
                                email:leadDetails.dataValues.email,
                                phone:leadDetails.dataValues.phone,
                                job:leadDetails.dataValues.job,
                                extraInfo:leadDetails.dataValues.extraInfo,
                                userId: req.params.userId,
                            }
                        })

                        if(leadCheck==null){
                            updateId = leadDetails.dataValues["id"];
                            leadDetails.dataValues["userId"] = req.params.userId
                            leadDetails.dataValues["id"] = null
                            let newLead = await Leads.create({ ...leadDetails.dataValues })
                            await Leads.update({ assigned:1 }, {
                                where: {
                                    id: updateId,
                                    userId: req.payload.id,
                                }
                            })
                            await AssignedLeads.create({ member_id: req.params.userId, team_id: req.payload.id, lead_id: newLead.dataValues.id})
                        
                        }else{
                            return;
                        }
                        
                    }
                    
                    
                })
                return res.status(200).json({
                    message: 'Leads assigned successfully',
                });
            } catch (error) {
                console.log(error);
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })


        // read all lead route.
router.get('/assign/leads/view-all',
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
            attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'assigned', 'name', 'email', 'extraInfo', 'notes', 'created_at'],
            include: [
                {
                    model: Users,
                    as: "member"
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


    // read all lead route.
router.get('/assign/leads/view-all/:userId',
verifyAccessToken,
async function (req, res) {
    try {
        let leads = await Leads.findAll({
            where: {
                userId: req.params.userId
            },
            order: [
                ['id', 'DESC'],
            ],
            attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'assigned', 'name', 'email', 'extraInfo', 'notes', 'created_at'],
            include: [
                {
                    model: Users,
                    as: "member"
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
