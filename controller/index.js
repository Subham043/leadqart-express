const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const db = require('../model/connection');
const Users = db.users;
const { body, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helper/jwt');
const { encrypt, decrypt } = require('../helper/crypt');
const { syncMail, asyncMail } = require('../helper/mail');
const { AuthLimiter } = require('../middleware/rate-limiter');
const { nameValidation, phoneValidation, emailValidation, passwordValidation, cpasswordValidation, otpValidation } = require('../helper/validation');
const { verifyAccessToken } = require('../helper/jwt');


//test router
router.get('/test', async (req, res) => {
    return res.status(200).json({ message: "connection successful" })
})

// registration page route.
router.post('/register',
    AuthLimiter,
    //custom validation for name
    body('name').custom(async (value) => nameValidation(value)),
    //custom validation for phone
    body('phone').custom(async (value) => phoneValidation(value)),
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),
    body('email').custom(async (value) => {
        let user = await Users.findAll({
            attributes: ['email'],
            where: {
                email: value,
            }
        })
        if (user.length > 0) {
            return Promise.reject('E-mail already in use');
        }
    }),
    //custom validation for password
    body('password').custom(async (value) => passwordValidation(value)),
    // password must be at least 5 chars long
    body('cpassword').custom((value, { req }) => cpasswordValidation(value, { req })),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { name, email, phone, password } = req.body;
            const hashPassword = bcrypt.hashSync(password, 10);
            const otp = (Math.floor(100000 + Math.random() * 900000));
            let userData = await Users.create({ name, phone, email, password: hashPassword, otp })
            try {
                await asyncMail(email, 'Email Verification', `<h3>Your otp is ${otp}</h3><br>`);
                return res.status(200).json({
                    message: 'Kindly check your email for verification process',
                    id: encrypt(userData.dataValues.id)
                });
            } catch (error) {
                await Users.destroy({
                    where: {
                        id: userData.dataValues.id
                    }
                })
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })



// email verification.
router.post('/verify/:userId',
    AuthLimiter,
    //custom validation for phone
    body('otp').custom(async (value) => otpValidation(value)),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let id = ""
            try {
                id = await decrypt(req.params.userId);
            } catch (error) {
                return res.status(200).json({
                    error: 'Invalid user id',
                });
            }
            let data = await Users.findAll({
                where: {
                    id: id,
                    verified: 0,
                }
            })
            if (data.length == 0) {
                return res.status(200).json({
                    error: 'Invalid user id',
                });
            }
            let { otp } = req.body;
            let updateData = await Users.findAll({
                where: {
                    id: id,
                    verified: 0,
                    otp
                }
            })
            if (updateData.length > 0) {
                const otp = (Math.floor(100000 + Math.random() * 900000));
                await Users.update({ otp, verified: 1, }, {
                    where: {
                        id: id
                    }
                })
                return res.status(200).json({
                    message: 'Email verified',
                });
            } else {
                return res.status(200).json({
                    error: 'Invalid OTP',
                });
            }
        }

    })


// forgot password
router.post('/forgot-password',
    AuthLimiter,
    //custom validation for email
    body('email').custom(async (value) => emailValidation(value)),

    body('email').custom(async (value) => {
        let user = await Users.findAll({
            attributes: ['email'],
            where: {
                email: value,
                verified: 1
            }
        })
        if (user.length < 1) {
            return Promise.reject('E-mail does not exist!!');
        }
    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let { email } = req.body;
            let data = await Users.findOne({
                attributes: ['id'],
                where: {
                    email,
                    verified: 1
                }
            })
            const otp = (Math.floor(100000 + Math.random() * 900000));
            await Users.update({ otp, changePassword: 1, }, {
                where: {
                    email,
                    verified: 1
                }
            })
            syncMail(email, 'Reset Password', `<h3>Your otp is ${otp}</h3><br>`);
            return res.status(200).json({
                message: 'Kindly check your email in order to reset your password',
                id: encrypt(data.dataValues.id)
            });
        }

    })

// reset password.
router.post('/reset-password/:userId',
    AuthLimiter,
    //custom validation for otp
    body('otp').custom(async (value) => otpValidation(value)),
    //custom validation for name
    body('password').custom(async (value) => passwordValidation(value)),
    // password must be at least 5 chars long
    body('cpassword').custom((value, { req }) => cpasswordValidation(value, { req })),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let id = ""
            try {
                id = await decrypt(req.params.userId);
            } catch (error) {
                return res.status(200).json({
                    error: 'Invalid user id',
                });
            }
            let data = await Users.findAll({
                where: {
                    id: id,
                    verified: 1,
                    changePassword: 1,
                }
            })
            if (data.length == 0) {
                return res.status(200).json({
                    error: 'Invalid user id',
                });
            }
            let { otp, password } = req.body;
            let updateData = await Users.findAll({
                where: {
                    id: id,
                    verified: 1,
                    changePassword: 1,
                    otp
                }
            })
            if (updateData.length > 0) {
                const otp = (Math.floor(100000 + Math.random() * 900000));
                await Users.update({ otp, changePassword: 0, password: bcrypt.hashSync(password, 10) }, {
                    where: {
                        id: id
                    }
                })
                return res.status(200).json({
                    message: 'Password Reset Successful',
                });
            } else {
                return res.status(200).json({
                    error: 'Invalid OTP',
                });
            }
        }

    })



// login page route.
// router.post('/login',
//     AuthLimiter,
//     //custom validation for email
//     body('email').custom(async (value) => emailValidation(value)),

//     body('email').custom(async (value) => {
//         let user = await Users.findAll({
//             attributes: ['email'],
//             where: {
//                 email: value,
//                 verified: 1
//             }
//         })
//         if (user.length < 1) {
//             return Promise.reject('E-mail does not exist');
//         }
//     }),
//     //custom validation for password
//     body('password').custom(async (value) => passwordValidation(value)),
//     async function (req, res) {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(200).json({
//                 errors: errors.mapped(),
//             });
//         } else {
//             let { email, password } = req.body;
//             try {
//                 let user = await Users.findOne({
//                     attributes: ['id', 'email', 'password'],
//                     where: {
//                         email: email,
//                         verified: 1,
//                     }
//                 });
//                 if (bcrypt.compareSync(password, user.dataValues.password)) {
//                     let accessToken = await signAccessToken(user.dataValues.id)
//                     let refreshToken = await signRefreshToken(user.dataValues.id)
//                     res.cookie('accessToken',accessToken, { maxAge: 300000, httpOnly: true });
//                     res.cookie('refreshToken',refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
//                     return res.status(200).json({
//                         message: 'Logged In Successfully',
//                         accessToken,
//                         refreshToken
//                     });
//                 } else {
//                     return res.status(200).json({
//                         error: 'Invalid Password',
//                     });
//                 }
//             } catch (error) {
//                 console.log(error)
//                 return res.status(200).json({
//                     error: 'Oops!! Something went wrong please try again.',
//                 });
//             }
//         }

//     })

router.post('/login',
    AuthLimiter,
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

                if (user.length == 0) {
                    let otp = (Math.floor(100000 + Math.random() * 900000));
                    let userData = await Users.create({ email, otp })
                    await asyncMail(email, 'Otp Verification', `<h3>Your otp is ${otp}</h3><br>`);
                    return res.status(200).json({
                        message: 'Kindly check your email for otp',
                        id: encrypt(userData.dataValues.id)
                    });

                } else {
                    let otp = (Math.floor(100000 + Math.random() * 900000));
                    await Users.update({ otp }, {
                        where: {
                            email
                        }
                    })
                    let userData = await Users.findOne({
                        attributes: ['id'],
                        where: {
                            email: email,
                        }
                    });
                    await asyncMail(email, 'Otp Verification', `<h3>Your otp is ${otp}</h3><br>`);
                    return res.status(200).json({
                        message: 'Kindly check your email for otp',
                        id: encrypt(userData.dataValues.id)
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

// login verification.
router.post('/login-verify/:userId',
    AuthLimiter,
    //custom validation for phone
    body('otp').custom(async (value) => otpValidation(value)),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            let id = ""
            try {
                id = await decrypt(req.params.userId);
            } catch (error) {
                return res.status(200).json({
                    error: 'Invalid user id',
                });
            }
            try {
                let data = await Users.findAll({
                    where: {
                        id: id,
                    }
                })
                if (data.length == 0) {
                    return res.status(200).json({
                        error: 'Invalid user id',
                    });
                }
                let { otp } = req.body;
                let updateData = await Users.findAll({
                    where: {
                        id: id,
                        otp
                    }
                })
                if (updateData.length > 0) {
                    const otp = (Math.floor(100000 + Math.random() * 900000));
                    await Users.update({ otp }, {
                        where: {
                            id: id
                        }
                    })
                    let accessToken = await signAccessToken(id)
                    let refreshToken = await signRefreshToken(id)
                    res.cookie('accessToken', accessToken, { maxAge: 300000, httpOnly: true });
                    res.cookie('refreshToken', refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                    return res.status(200).json({
                        message: 'Logged In Successfully',
                        accessToken,
                        refreshToken
                    });
                } else {
                    return res.status(200).json({
                        error: 'Invalid OTP',
                    });
                }
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })

    router.get('/profile',
    verifyAccessToken,
    async function (req, res) {
        try {
            let user = await Users.findOne({
                where: {
                    id: req.payload.id,
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['name', 'email', 'phone', 'created_at'],
            })
            return res.status(200).json({
                message: 'Profile recieved successfully',
                user
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

    // edit lead note route.
router.post('/profile',
//custom validation for name
body('name').custom(async (value) => nameValidation(value)),
//custom validation for phone
body('phone').custom(async (value) => phoneValidation(value)),
verifyAccessToken,
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({
            errors: errors.mapped(),
        });
    } else {
        let { name,phone } = req.body;

        try {
            await Users.update({ name,phone }, {
                where: {
                    id: req.payload.id,
                }
            })
            return res.status(200).json({
                message: 'Profile updated successfully',
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }
    }

})

// refresh token route.
router.get('/refresh-token',
    async function (req, res) {
        try {
            if (!req.headers['refreshtoken']) {
                return res.status(200).json({
                    error: 'Unauthorised',
                });
            }
            const rToken = req.headers['refreshtoken'];
            let id = await verifyRefreshToken(rToken)
            let accessToken = await signAccessToken(id)
            let refreshToken = await signRefreshToken(id)
            res.cookie('accessToken', accessToken, { maxAge: 300000, httpOnly: true });
            res.cookie('refreshToken', refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            return res.status(200).json({
                message: 'Logged In Successfully',
                accessToken,
                refreshToken
            });
        } catch (error) {
            console.log(error)
            return res.status(200).json({
                error: 'Unauthorised',
            });
        }

    })


module.exports = router;
