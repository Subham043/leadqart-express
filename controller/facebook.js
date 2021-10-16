const express = require('express');
const router = express.Router();
const got = require('got');
const { verifyAccessTokenCookie } = require('../helper/jwt');
const db = require('../model/connection');
const Facebook = db.facebook;


//facebook login redirection
router.get('/', verifyAccessTokenCookie, async (req, res) => {
    return res.redirect('https://www.facebook.com/v9.0/dialog/oauth?client_id=455099129250811&scope=pages_show_list,ads_management,pages_read_engagement,leads_retrieval,pages_manage_metadata,pages_manage_ads&redirect_uri=https://leadqart.herokuapp.com/facebook/connection');
})

//after facebook login redirection
router.get('/connection', verifyAccessTokenCookie, async (req, res) => {
    if((req.query.code).length>0){
        const code = req.query.code;
        try {
            const {access_token} = await got(`https://graph.facebook.com/v9.0/oauth/access_token?client_id=455099129250811&redirect_uri=https://leadqart.herokuapp.com/facebook/connection&client_secret=2d447f6b8cc41bab1e4cdf86040d7cee&code=${code}`).json();
            let facebook = await Facebook.findAll({
                attributes: ['id','userId'],
                where: {
                    userId: req.payload.id,
                }
            })
            if (facebook.length == 0) {
                await Facebook.create({ userId:req.payload.id, token:access_token })
            }else{
                await Facebook.update({ token:access_token }, {
                    where: {
                        userId: req.payload.id
                    }
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(200).render('connection');
        }
    }else if((req.query.error).length>0){
        return res.status(200).render('connection');
    }else{
        return res.status(200).render('connection');
    }
})




module.exports = router;