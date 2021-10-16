const express = require('express');
const router = express.Router();
const got = require('got');
const { verifyAccessTokenCookie } = require('../helper/jwt');
const db = require('../model/connection');
const Facebook = db.facebook;


//facebook login redirection
router.get('/', async (req, res) => {
    try{
        let payload = await verifyAccessTokenCookie();
        return res.redirect(`https://www.facebook.com/v9.0/dialog/oauth?client_id=${process.env.FACEBOOKCLIENTID}&scope=pages_show_list,ads_management,pages_read_engagement,leads_retrieval,pages_manage_metadata,pages_manage_ads&redirect_uri=https://leadqart.herokuapp.com/facebook/connection`);
    }catch(e){
        return res.status(400).render('connection');
    }
})

//after facebook login redirection
router.get('/connection', async (req, res) => {
    try{
        let payload = await verifyAccessTokenCookie();
        if((req.query.code).length>0){
            const code = req.query.code;
            try {
                const {access_token} = await got(`https://graph.facebook.com/v9.0/oauth/access_token?client_id=${process.env.FACEBOOKCLIENTID}&redirect_uri=https://leadqart.herokuapp.com/facebook/connection&client_secret=${process.env.FACEBOOKCLIENTSECRET}&code=${code}`).json();
                let facebook = await Facebook.findAll({
                    attributes: ['id','userId'],
                    where: {
                        userId: payload.id,
                    }
                })
                if (facebook.length == 0) {
                    await Facebook.create({ userId:payload.id, token:access_token })
                }else{
                    await Facebook.update({ token:access_token }, {
                        where: {
                            userId: payload.id
                        }
                    })
                }
                return res.status(200).render('connection_success');
            } catch (error) {
                console.log(error);
                return res.status(400).render('connection');
            }
        }else{
            return res.status(400).render('connection');
        }
    }catch (error) {
        return res.status(400).render('connection');
    }
    
})




module.exports = router;