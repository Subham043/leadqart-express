const express = require('express');
const router = express.Router();
const { body, check, validationResult } = require('express-validator');
const { Sequeize, Op, QueryTypes } = require('sequelize');
const { verifyAccessToken } = require('../helper/jwt');
const db = require('../model/connection');
const Users = db.users;
const contentPage = db.contentPage;
const { emptyTextValidation, IDValidation } = require('../helper/validation');
const uuid4 = require('uuid4');
const fs = require('fs');

// create follow-up route.
router.post('/create/',
    verifyAccessToken,
    //custom validations
    body('title').custom(async (value) => emptyTextValidation(value, 'title')),
    body('description').custom(async (value) => emptyTextValidation(value, 'description')),
    body('youtubeVideo').custom(async (value) => emptyTextValidation(value, 'youtubeVideo')),
    body('map').custom(async (value) => emptyTextValidation(value, 'map')),
    body('image').custom(async (value, { req }) => {
        if(!req.files || Object.keys(req.files).length === 0){
            return Promise.reject('Please select a file');
        }
        if (req.files.image.mimetype == 'image/png' || req.files.image.mimetype == 'image/jpg' || req.files.image.mimetype == 'image/jpeg') {
            return true
        }
        return Promise.reject('Invalid image type');
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
                let sampleFile = req.files.image;
                let newFileName = `${uuid4()}-${sampleFile.name}`;
                let uploadPath = 'public/uploads/' + newFileName;
    
               
                let {title,description,youtubeVideo,map} = req.body;
                // Use the mv() method to place the file somewhere on your server
                sampleFile.mv(uploadPath, async function (err) {
                    if (err){
                        return res.status(200).json({ errors:err });
                    }
                    await contentPage.create({ title,description,youtubeVideo,map, image: newFileName, userId: req.payload.id })
                });
                return res.status(200).json({
                    message: 'content page stored successfully',
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
    check('id').custom(async (value) => IDValidation(value, 'content page id')),
    check('id').custom(async (value, { req }) => {
        let lead = await contentPage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content page');
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
                let cFile = await contentPage.findOne({
                    attributes: ['id','image'],
                    where: {
                        id: req.params.id,
                        userId: req.payload.id,
                    }
                })
                fs.unlink(`public/uploads/${cFile.dataValues.image}`, async (err) => {
                    if (err){
                        return res.status(200).json({
                            error: 'Oops!! Something went wrong please try again.',
                        });
                    }
                    await contentPage.destroy({
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    return res.status(200).json({
                        message: 'content page removed successfully',
                    });
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
    check('id').custom(async (value) => IDValidation(value, 'content page id')),
    check('id').custom(async (value, { req }) => {
        let lead = await contentPage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content page');
        }
    }),
    body('title').custom(async (value) => emptyTextValidation(value, 'title')),
    body('description').custom(async (value) => emptyTextValidation(value, 'description')),
    body('youtubeVideo').custom(async (value) => emptyTextValidation(value, 'youtubeVideo')),
    body('map').custom(async (value) => emptyTextValidation(value, 'map')),
    body('image').custom(async (value, { req }) => {
        if(req.files){
            if (req.files.image.mimetype == 'image/png' || req.files.image.mimetype == 'image/jpg' || req.files.image.mimetype == 'image/jpeg') {
                return true
            }
            return Promise.reject('Invalid image type');
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
                    let cFile = await contentPage.findOne({
                        attributes: ['id','image'],
                        where: {
                            id: req.params.id,
                            userId: req.payload.id,
                        }
                    })
                    fs.unlink(`public/uploads/${cFile.dataValues.image}`, async (err) => {
                        if (err){
                            return res.status(200).json({
                                message: 'Oops!! Something went wrong please try again.',
                            });
                        }
                        let sampleFile = req.files.image;
                        let newFileName = `${uuid4()}-${sampleFile.name}`;
                        let uploadPath = 'public/uploads/' + newFileName;
                        let {title,description,youtubeVideo,map} = req.body;
                        sampleFile.mv(uploadPath, async function (err) {
                            if (err){
                                return res.status(200).json({ errors:err });
                            }
                            await contentPage.update({ title,description,youtubeVideo,map, image: newFileName },{
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
                    let {title,description,youtubeVideo,map} = req.body;
                    await contentPage.update({ title,description,youtubeVideo,map },{
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
            let leads = await contentPage.findAll({
                where: {
                    userId: req.payload.id
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Content page recieved successfully',
                contentPage:leads
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
        let lead = await contentPage.findAll({
            attributes: ['id'],
            where: {
                id: value,
                userId: req.payload.id,
            }
        })
        if (lead.length == 0) {
            return Promise.reject('Invalid content page id');
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
            let leads = await contentPage.findOne({
                where: {
                    userId: req.payload.id,
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
            })
            return res.status(200).json({
                message: 'Content page recieved successfully',
                contentPage:leads
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

    router.get('/view-page/:id', async (req, res) => {
        try{
            let leads = await contentPage.findOne({
                where: {
                    id: req.params.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                include: [
                    {
                        model: Users,
                        attributes: ['id', 'name', 'phone'],
                    },
                ],
            })
            if(Object.keys(leads).length === 0){
                return res.status(400).render('error');
            }
            return res.status(200).render('content_page',{leads});
        }catch (error) {
            console.log(error)
            return res.status(400).render('error');
        }
        
    })







module.exports = router;