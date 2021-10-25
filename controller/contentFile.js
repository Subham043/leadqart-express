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

// create follow-up route.
router.post('/create/',
    verifyAccessToken,
    //custom validations
    body('name').custom(async (value) => textValidation(value, 'name')),
    body('upload').custom(async (value, { req }) => {
        if (req.files.upload.mimetype == 'aplication/pdf' || req.files.upload.mimetype == 'image/png' || req.files.upload.mimetype == 'image/jpg' || req.files.upload.mimetype == 'image/jpeg') {
            return true
        }
        return Promise.reject('Invalid file type');
    }),

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ errors: 'No files were uploaded.' });
            }
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            let sampleFile = req.files.upload;
            let newFileName = `${uuid4()}-${sampleFile.name}`;
            let uploadPath = 'public/uploads/' + newFileName;

           
            let {name} = req.body;
            try {
                await contentFile.create({ name, upload: newFileName, userId: req.payload.id })
                 // Use the mv() method to place the file somewhere on your server
                sampleFile.mv(uploadPath, function (err) {
                    if (err)
                        return res.status(500).json({ err });
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
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {

            try {
                await contentFile.destroy({
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'content file removed successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
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
    body('message').custom(async (value) => textValidation(value, 'message')),
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.mapped(),
            });
        } else {
            let { title, message } = req.body;
            try {
                let updateData = await contentMessage.update({ title, message }, {
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'content message updated successfully',
                });
            } catch (error) {
                return res.status(400).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }


        }

    })









module.exports = router;