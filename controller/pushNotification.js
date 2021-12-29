const express = require('express');
const router = express.Router();
const got = require('got');
const { verifyAccessToken, verifyAccessTokenCookie } = require('../helper/jwt');
const { body, validationResult } = require('express-validator');
const db = require('../model/connection');
const PushNotifictaion = db.PushNotifictaion;
const { textValidation } = require('../helper/validation');



router.post('/create', verifyAccessToken, async (req, res) => {
    try {
        
            let pushNT = await PushNotifictaion.findAll({
                attributes: ['id', 'userId'],
                where: {
                    userId: req.payload.id,
                }
            })
            let { token } = req.body;
            if (pushNT.length == 0) {
                await PushNotifictaion.create({ userId: req.payload.id, token: token })
            } else {
                await PushNotifictaion.update({ token: token }, {
                    where: {
                        userId: req.payload.id,
                    }
                })
            }
        return res.status(200).json({ message:"Push notification stored successfully" });
    } catch (error) {
        console.log(error);
        return res.status(400);
    }
})


module.exports = router;