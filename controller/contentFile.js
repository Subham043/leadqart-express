const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const contentFile = db.contentFile;
const { textValidation, IDValidation } = require('../helper/validation');
const uuid4 = require('uuid4');
const fs = require('fs');

// create follow-up route.
router.post('/create/',
    verifyAccessToken,
    //custom validations
    body('name').custom(async (value) => textValidation(value, 'name')),
    body('upload').custom(async (value, { req }) => {
        if(!req.files || Object.keys(req.files).length === 0){
            return Promise.reject('Please select a file');
        }
        if (req.files.upload.mimetype != 'application/pdf') {
            return Promise.reject('Invalid file type');
        }
        return true;
    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(200).json({ error: 'No files were uploaded.' });
            }
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            try {
                let sampleFile = req.files.upload;
                let newFileName = `${uuid4()}-${sampleFile.name}`;
                let uploadPath = 'public/uploads/' + newFileName;
    
               
                let {name} = req.body;
                // Use the mv() method to place the file somewhere on your server
                sampleFile.mv(uploadPath, async function (err) {
                    if (err){
                        return res.status(500).json({ err });
                    }
                    await contentFile.create({ name, upload: newFileName, userId: req.payload.id })
                });
                return res.status(200).json({
                    message: 'content file stored successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
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
        let lead = await contentFile.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content file');
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
                let cFile = await contentFile.findOne({
                    attributes: ['id','upload'],
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                fs.unlink(`public/uploads/${cFile.dataValues.upload}`, async (err) => {
                    if (err){
                        return res.status(200).json({
                            error: 'Oops!! Something went wrong please try again.',
                        });
                    }
                    await contentFile.destroy({
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    return res.status(200).json({
                        message: 'content file removed successfully',
                    });
                  });
                
            } catch (error) {
                console.log(error);
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
    check('id').custom(async (value) => IDValidation(value, 'content file id')),
    check('id').custom(async (value, { req }) => {
        let lead = await contentFile.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content file');
        }
    }),
    body('name').custom(async (value) => textValidation(value, 'name')),
    body('upload').custom(async (value, { req }) => {
        if(req.files){
            if (req.files.upload.mimetype == 'application/pdf' || req.files.upload.mimetype == 'image/png' || req.files.upload.mimetype == 'image/jpg' || req.files.upload.mimetype == 'image/jpeg') {
                return true
            }
            return Promise.reject('Invalid file type');
        }
        return true;
        
    }),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            try{
                if (req.files) {
                    let cFile = await contentFile.findOne({
                        attributes: ['id','upload'],
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    fs.unlink(`public/uploads/${cFile.dataValues.upload}`, async (err) => {
                        if (err){
                            return res.status(200).json({
                                error: 'Oops!! Something went wrong please try again.',
                            });
                        }
                        let sampleFile = req.files.upload;
                        let newFileName = `${uuid4()}-${sampleFile.name}`;
                        let uploadPath = 'public/uploads/' + newFileName;
                        let {name} = req.body;
                        sampleFile.mv(uploadPath, async function (err) {
                            if (err){
                                return res.status(200).json({ errors:err });
                            }
                            await contentFile.update({ name, upload: newFileName },{
                                where: {
                                    id: req.params.id,
                                    userId: req.payload.id,
                                }
                            })
                        });
                        return res.status(200).json({
                            message: 'content file updated successfully',
                        });
                      });
                }else{
                    let {name} = req.body;
                    await contentFile.update({ name },{
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    return res.status(200).json({
                        message: 'content file updated successfully',
                    });
                }
            }catch(err){
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
            let leads = await contentFile.findAll({
                where: {
                    userId: req.payload.id
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Content file recieved successfully',
                contentFile:leads
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
        let lead = await contentFile.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content file id');
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
            let leads = await contentFile.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Content file recieved successfully',
                contentFile:leads
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })







module.exports = router;
