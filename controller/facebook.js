const express = require('express');
const router = express.Router();
const got = require('got');
const { verifyAccessToken, verifyAccessTokenCookie } = require('../helper/jwt');
const { body, validationResult } = require('express-validator');
const db = require('../model/connection');
const Facebook = db.facebook;
const FacebookPage = db.facebookPage;
const Webhook = db.Webhook;
const { textValidation } = require('../helper/validation');


//facebook login redirection
router.get('/', verifyAccessTokenCookie, async (req, res) => {
    return res.redirect(`https://www.facebook.com/v9.0/dialog/oauth?client_id=${process.env.FACEBOOKCLIENTID}&scope=pages_show_list,ads_management,pages_read_engagement,leads_retrieval,pages_manage_metadata,pages_manage_ads&redirect_uri=https://leadqart.herokuapp.com/facebook/connection`);
})

//after facebook login redirection
router.get('/connection', verifyAccessTokenCookie, async (req, res) => {
    try {
        if ((req.query.code).length > 0) {
            const code = req.query.code;
            try {
                const { access_token } = await got(`https://graph.facebook.com/v9.0/oauth/access_token?client_id=${process.env.FACEBOOKCLIENTID}&redirect_uri=https://leadqart.herokuapp.com/facebook/connection&client_secret=${process.env.FACEBOOKCLIENTSECRET}&code=${code}`).json();
                let facebook = await Facebook.findAll({
                    attributes: ['id', 'userId'],
                    where: {
                        userId: req.payload.id,
                    }
                })
                if (facebook.length == 0) {
                    await Facebook.create({ userId: req.payload.id, token: access_token })
                } else {
                    await Facebook.update({ token: access_token }, {
                        where: {
                            userId: req.payload.id
                        }
                    })
                }
                return res.status(200).render('connection_success');
            } catch (error) {
                console.log(error);
                return res.status(400).render('connection');
            }
        } else {
            console.log(error)
            return res.status(400).render('connection');
        }
    } catch (error) {
        console.log(error)
        return res.status(400).render('connection');
    }

})

//after facebook login from app
router.post('/connection/app',
    verifyAccessToken,
    body('fbName').custom(async (value) => textValidation(value, 'fbName')),
    body('fbId').custom(async (value) => textValidation(value, 'fbId')),
    body('access_token').custom(async (value) => textValidation(value, 'access_token')),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.mapped(),
            });
        } else {
            try {
                let { access_token, fbId, fbName } = req.body;
                let facebook = await Facebook.findAll({
                    attributes: ['id', 'userId'],
                    where: {
                        userId: req.payload.id,
                    }
                })
                if (facebook.length == 0) {
                    await Facebook.create({ userId: req.payload.id, token: access_token, fbId, fbName })
                } else {
                    await Facebook.update({ token: access_token, fbId, fbName }, {
                        where: {
                            userId: req.payload.id
                        }
                    })
                }
                return res.status(200).json({
                    message: 'facebook token stored successfully',
                });
            } catch (error) {
                console.log(error);
                return res.status(200).json({
                    error: 'Oops!! Something went wrong please try again.',
                });
            }
        }


    })

router.get('/token/detail',
    verifyAccessToken,
    async (req, res) => {
        try {
            let facebook = await Facebook.findAll({
                where: {
                    userId: req.payload.id,
                }
            })
            if (facebook.length == 0) {
                return res.status(200).json({
                    message: 'No facebook token details available',
                    facebookDetails:{}
                });
            } else {
                let facebookDetails = await Facebook.findOne({
                    where: {
                        userId: req.payload.id,
                    }
                })
                return res.status(200).json({
                    message: 'Facebook token details recieved successfully',
                    facebookDetails:facebookDetails
                });
            }
            
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                error: 'Oops!! Something went wrong please try again.',
            });
        }


    })


//facebook login redirection
router.get('/ramya', async (req, res) => {
    return res.redirect(`https://www.facebook.com/v9.0/dialog/oauth?client_id=${process.env.FACEBOOKCLIENTID}&scope=pages_show_list,ads_management,pages_read_engagement,leads_retrieval,pages_manage_metadata,pages_manage_ads&redirect_uri=https://leadqart.herokuapp.com/facebook/connection/ramya`);
})

//after facebook login redirection
router.get('/connection/ramya', async (req, res) => {
    try {
        if ((req.query.code).length > 0) {
            const code = req.query.code;
            try {
                const { access_token } = await got(`https://graph.facebook.com/v9.0/oauth/access_token?client_id=${process.env.FACEBOOKCLIENTID}&redirect_uri=https://leadqart.herokuapp.com/facebook/connection/ramya&client_secret=${process.env.FACEBOOKCLIENTSECRET}&code=${code}`).json();
                let facebook = await Facebook.findAll({
                    attributes: ['id', 'userId'],
                    where: {
                        userId: 2,
                    }
                })
                if (facebook.length == 0) {
                    await Facebook.create({ userId: 2, token: access_token })
                } else {
                    await Facebook.update({ token: access_token }, {
                        where: {
                            userId: 2
                        }
                    })
                }
                return res.status(200).render('connection_success');
            } catch (error) {
                console.log(error);
                return res.status(400).render('connection');
            }
        } else {
            console.log(error)
            return res.status(400).render('connection');
        }
    } catch (error) {
        console.log(error)
        return res.status(400).render('connection');
    }

})


//manage_pages permission
//get page information using fb token
router.get('/pages/:fbid/:token', verifyAccessToken, async (req, res) => {
    try {
        const fbid = req.params.fbid;
        const token = req.params.token;
        // const resp = await got(`https://graph.facebook.com/v9.0/${fbid}/accounts?access_token=${token}`).json();
        const resp = await got(`https://graph.facebook.com/v9.0/me/accounts?access_token=${token}`).json();
        let page_response = [];
        let page_object = {};
        resp.data.map((item) => {
            page_object.access_token = item.access_token;
            page_object.name = item.name;
            page_object.id = item.id;
            page_response.push(page_object);
            page_object = {}
        })
        return res.status(200).json({ response: page_response });
        // return res.status(200).json({response:page_response});
    } catch (error) {
        console.log(error);
        return res.status(400);
    }
})

//subscribe to webhook using page information from fb token
router.get('/pages/subscribe/:page_id/:page_token', verifyAccessToken, async (req, res) => {
    try {
        const page_id = req.params.page_id;
        const page_token = req.params.page_token;
        const resp = await got.post(`https://graph.facebook.com/v9.0/${page_id}/subscribed_apps`, {
            json: {
                access_token: page_token,
                subscribed_fields: 'leadgen'
            },
            responseType: 'json'
        })
        if(resp.body.success==true) {
            let fbPage = await FacebookPage.findAll({
                attributes: ['id', 'userId'],
                where: {
                    userId: req.payload.id,
                    fbPageId:page_id
                }
            })
            if (fbPage.length == 0) {
                await FacebookPage.create({ userId: req.payload.id, token: page_token, fbPageId:page_id })
            } else {
                await FacebookPage.update({ token: page_token }, {
                    where: {
                        userId: req.payload.id,
                        fbPageId:page_id
                    }
                })
            }
        }
        return res.status(200).json({ response: resp.body });
    } catch (error) {
        console.log(error);
        return res.status(400);
    }
})

// Adds support for GET requests to our webhook
router.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "abc123"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log(challenge);
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});



// Creates the endpoint for our webhook 
router.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // console.log(body.entry.changes);
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(async function (entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            // let webhook_event = entry.messaging[0];
            // let webhook_event = entry.messaging;
            console.log(entry.id);
            console.log(entry.time);
            console.log(entry.changes);
            console.log(entry);
            try {

                await Webhook.create({ message: JSON.stringify(entry.changes) })
            } catch (error) {
                console.log(error);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});




module.exports = router;