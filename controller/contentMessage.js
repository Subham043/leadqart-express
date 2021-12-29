const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const contentMessage = db.contentMessage;
const { textValidation, IDValidation } = require('../helper/validation');
const uuid4 = require('uuid4');
const fs = require('fs');


// create follow-up route.
router.post('/create/',
    verifyAccessToken,
    //custom validations
    body('title').custom(async (value) => textValidation(value, 'title')),
    // body('message').custom(async (value) => textValidation(value, 'message')),
    // body('image').custom(async (value, { req }) => {
    //     if (req.files) {
    //         if (req.files.image.mimetype == 'image/png' || req.files.image.mimetype == 'image/jpg' || req.files.image.mimetype == 'image/jpeg') {
    //             return true
    //         }
    //         return Promise.reject('Invalid image type');
    //     }
    //     return true;

    // }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            // if (!req.files || Object.keys(req.files).length === 0) {
            //     return res.status(200).json({ error: 'No files were uploaded.' });
            // }


            try {
                // let sampleFile = req.files.image;
                // let newFileName = `${uuid4()}-${sampleFile.name}`;
                // let uploadPath = 'public/uploads/' + newFileName;


                let { title, message } = req.body;
                // Use the mv() method to place the file somewhere on your server
                // sampleFile.mv(uploadPath, async function (err) {
                //     if (err) {
                //         return res.status(200).json({ errors: err });
                //     }
                    await contentMessage.create({ title, message, userId: req.payload.id })
                // });

                return res.status(200).json({
                    message: 'content message stored successfully',
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
    check('id').custom(async (value) => IDValidation(value, 'content message id')),
    check('id').custom(async (value, { req }) => {
        let lead = await contentMessage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content message');
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
                let cFile = await contentMessage.findOne({
                    attributes: ['id','image'],
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                // fs.unlink(`public/uploads/${cFile.dataValues.image}`, async (err) => {
                //     if (err){
                //         return res.status(200).json({
                //             error: 'Oops!! Something went wrong please try again.',
                //         });
                //     }
                    await contentMessage.destroy({
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    return res.status(200).json({
                        message: 'content message removed successfully',
                    });
                //   });
                
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
        let lead = await contentMessage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content message');
        }
    }),
    body('title').custom(async (value) => textValidation(value, 'title')),
    // body('message').custom(async (value) => textValidation(value, 'message')),
    // body('image').custom(async (value, { req }) => {
    //     if (req.files) {
    //         if (req.files.image.mimetype == 'image/png' || req.files.image.mimetype == 'image/jpg' || req.files.image.mimetype == 'image/jpeg') {
    //             return true
    //         }
    //         return Promise.reject('Invalid image type');
    //     }
    //     return true;

    // }),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            try {
                // if (req.files) {
                //     let cFile = await contentMessage.findOne({
                //         attributes: ['id','image'],
                //         where: {
                //             id: req.params.id,
                //             userId: req.payload.id,
                //         }
                //     })
                //     fs.unlink(`public/uploads/${cFile.dataValues.image}`, async (err) => {
                //         if (err){
                //             return res.status(200).json({
                //                 message: 'Oops!! Something went wrong please try again.',
                //             });
                //         }
                //         let sampleFile = req.files.image;
                //         let newFileName = `${uuid4()}-${sampleFile.name}`;
                //         let uploadPath = 'public/uploads/' + newFileName;
                //         let { title, message } = req.body;
                //         sampleFile.mv(uploadPath, async function (err) {
                //             if (err){
                //                 return res.status(200).json({ errors:err });
                //             }
                //             await contentMessage.update({ title, message, image: newFileName }, {
                //                 where: {
                //                     id: req.params.id,
                //                     userId: req.payload.id,
                //                 }
                //             })
                //         });
                //         return res.status(200).json({
                //             message: 'content message updated successfully',
                //         });
                //     })
                // } else {
                    let { title, message } = req.body;
                    await contentMessage.update({ title, message }, {
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    return res.status(200).json({
                        message: 'content message updated successfully',
                    });
                // }
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
            let leads = await contentMessage.findAll({
                where: {
                    userId: req.payload.id
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Content message recieved successfully',
                contentMessage: leads
            });
        } catch (error) {
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
        let lead = await contentMessage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content message id');
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
            let leads = await contentMessage.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Content message recieved successfully',
                contentMessage: leads
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })






module.exports = router;