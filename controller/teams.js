const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const db = require('../model/connection');
const Users = db.users;
const Team = db.team;
const { body, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helper/jwt');
const { encrypt, decrypt } = require('../helper/crypt');
const { syncMail, asyncMail } = require('../helper/mail');
const { AuthLimiter } = require('../middleware/rate-limiter');
const { nameValidation, phoneValidation, emailValidation, passwordValidation, cpasswordValidation, otpValidation } = require('../helper/validation');
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
                    let userData = await Users.create({ email, otp })
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


module.exports = router;
