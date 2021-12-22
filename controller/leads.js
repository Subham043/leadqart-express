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
const uuid4 = require('uuid4');
const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');
const csv = require('csv-parser')
const CsvParser = require("json2csv").Parser;

// create lead route.
router.post('/create',
    //custom validations
    body('leads.*.leadSource').custom(async (value) => emptyTextValidation(value, 'leadSource')),
    body('leads.*.facebookPage').custom(async (value) => emptyTextValidation(value, 'facebookPage')),
    body('leads.*.campaign').custom(async (value) => emptyTextValidation(value, 'campaign')),
    body('leads.*.adset').custom(async (value) => emptyTextValidation(value, 'adset')),
    body('leads.*.ad').custom(async (value) => emptyTextValidation(value, 'ad')),
    body('leads.*.formName').custom(async (value) => emptyTextValidation(value, 'formName')),
    body('leads.*.name').custom(async (value) => emptyTextValidation(value, 'name')),
    body('leads.*.job').custom(async (value) => emptyTextValidation(value, 'job')),
    //custom validation for phone
    body('leads.*.phone').custom(async (value) => emptyTextValidation(value, 'phone')),
    body('leads.*.email').custom(async (value) => emptyTextValidation(value, 'email')),
    body('leads.*.extraInfo').custom(async (value) => emptyTextValidation(value, 'extraInfo')),
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
    body('name').custom(async (value) => emptyTextValidation(value, 'name')),
    body('job').custom(async (value) => emptyTextValidation(value, 'job')),
    body('email').custom(async (value) => emptyTextValidation(value, 'email')),
    body('notes').custom(async (value) => emptyTextValidation(value, 'notes')),
    body('extraInfo').custom(async (value) => emptyTextValidation(value, 'extraInfo')),
    //custom validation for phone
    body('phone').custom(async (value) => emptyTextValidation(value)),
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
            let { leadSource, facebookPage, campaign, adset, ad, formName, job, phone, notes, extraInfo, email, name } = req.body;

            try {
                await Leads.update({ leadSource, facebookPage, campaign, adset, ad, formName, job, phone, notes, extraInfo, email, name }, {
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

    // edit lead note route.
router.get('/status/:id/:status',
verifyAccessToken,
async function (req, res) {

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
            await Leads.update({ newLead:req.params.status }, {
                where: {
                    id: req.params.id,
                    userId: req.payload.id,
                }
            })
            return res.status(200).json({
                message: 'Status updated successfully',
            });
        } catch (error) {
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

})

// delete lead route.
router.delete('/delete/:id',
    verifyAccessToken,
    async function (req, res) {

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
                console.log(error);
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


// read all lead route.
router.get('/view-all/new-leads',
    verifyAccessToken,
    async function (req, res) {
        try {
            let leads = await Leads.findAll({
                where: {
                    userId: req.payload.id,
                    newLead: 1
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


router.post('/create-via-excel/',
    verifyAccessToken,
    //custom validations
    body('upload').custom(async (value, { req }) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return Promise.reject('Please select a file');
        }
        if (req.files.upload.mimetype == 'text/csv' || req.files.upload.mimetype == 'text/comma-separated-values' || req.files.upload.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.files.upload.mimetype == 'application/vnd.ms-excel') {
            return true;
        }
        return Promise.reject('Invalid file type');
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

                // Use the mv() method to place the file somewhere on your server
                sampleFile.mv(uploadPath, async function (err) {
                    if (err) {
                        return res.status(200).json({ err });
                    }
                });

                if (req.files.upload.mimetype == 'text/csv' || req.files.upload.mimetype == 'text/comma-separated-values') {
                    let csvData = [];
                    fs.createReadStream(uploadPath)
                        .pipe(csv())
                        .on('data', (data) => csvData.push(data))
                        .on('end', () => {

                            csvData.forEach(async (lead) => {
                                let checkLead = await Leads.findAll({
                                    where: {
                                        userId: req.payload.id,
                                        phone:lead.phone,
                                        email:lead.email,
                                    },
                                    order: [
                                        ['id', 'DESC'],
                                    ],
                                    attributes: ['id',],
                                })
                                if(checkLead.length > 0) {
                                    return;
                                }else{
                                    await Leads.create({ ...lead, userId: req.payload.id })
                                }
                            })
                            // console.log(csvData)
                            return res.status(200).json({
                                message: 'lead stored successfully',
                            });
                        });
                } else {

                    readXlsxFile(uploadPath).then((rows) => {
                        // skip header
                        rows.shift();

                        let data = [];

                        rows.forEach(async (row) => {
                            let excelData = {
                                leadSource: row[0],
                                facebookPage: row[1],
                                campaign: row[2],
                                adset: row[3],
                                ad: row[4],
                                formName: row[5],
                                name: row[6],
                                job: row[7],
                                phone: row[8],
                                email: row[9],
                                extraInfo: row[10],
                            };
                            data.push(excelData);
                        });

                        data.forEach(async (lead) => {
                             let checkLead = await Leads.findAll({
                                    where: {
                                        userId: req.payload.id,
                                        phone:lead.phone,
                                        email:lead.email,
                                    },
                                    order: [
                                        ['id', 'DESC'],
                                    ],
                                    attributes: ['id',],
                                })
                                if(checkLead.length > 0) {
                                    return;
                                }else{
                                    await Leads.create({ ...lead, userId: req.payload.id })
                                }
                        })
                        // console.log(data)
                        return res.status(200).json({
                            message: 'lead stored successfully',
                        });
                    })
                        .catch((err) => {
                            console.log(err);
                            return res.status(200).json({
                                message: 'Oops!! Something went wrong please try again.',
                            });
                        })
                }



            } catch (error) {
                console.log(error);
                return res.status(200).json({
                    message: 'Oops!! Something went wrong please try again.',
                });
            }
        }

    })


// read all lead route.
router.get('/export-csv',
    verifyAccessToken,
    async function (req, res) {
        try {
            let leads = await Leads.findAll({
                raw: true,
                where: {
                    userId: req.payload.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                attributes: ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo', 'created_at'],
            })

            let csvDataArray = [];
            
            leads.map((obj) => {
                const { id, leadSource, facebookPage, campaign, adset, ad, formName, phone, job, newLead, name, email, extraInfo, created_at } = obj;
                // console.log(obj);
                csvDataArray.push({ id, leadSource, facebookPage, campaign, adset, ad, formName, phone, job, newLead, name, email, extraInfo, created_at });
            });
            const csvFields = ['id', 'leadSource', 'facebookPage', 'campaign', 'adset', 'ad', 'formName', 'phone', 'job', 'newLead', 'name', 'email', 'extraInfo', 'created_at'];
            const csvParser = new CsvParser({ csvFields });
            const csvData = csvParser.parse(csvDataArray);
            // console.log(leads.dataValues);

            let sampleFile = csvData;
            let newFileName = `${uuid4()}-file.csv`;
            let uploadPath = 'public/uploads/' + newFileName;

            fs.writeFile(uploadPath, csvData, 'utf8', function(err) {
                if (err) {
                    console.log('Some error occured - file either not saved or corrupted file saved.');
                } else {
                    console.log('It\'s saved!');
                }
            });

            return res.status(200).json({
                message: 'Lead recieved successfully',
                csv:newFileName
            });
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }

    })

module.exports = router;
