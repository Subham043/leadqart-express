const JWT  = require('jsonwebtoken');
module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userId,
            }
            const secret = process.env.JWTRSECURITYKEYACCESS;
            const options = {
                expiresIn: "5m",
                issuer: "leadqart.com",
                // audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err){
                    reject(err);
                }
                resolve(token);
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if(!req.headers['authorization']){
            return res.status(401).json({
                message: 'Unauthorised',
            });
        }
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        JWT.verify(token,process.env.JWTRSECURITYKEYACCESS,(err,payload) => {
            if(err) {
                return res.status(401).json({
                    message: 'Unauthorised',
                });
            }
            req.payload = payload;
            next();
        })
    },
    verifyAccessTokenCookie: () => {
        if(!req.cookies.accessToken){
            return res.status(200).render('connection');
        }
        const token = req.cookies.accessToken;
        JWT.verify(token,process.env.JWTRSECURITYKEYACCESS,(err,payload) => {
            if(err) {
                console.log(error)
                return res.status(400).render('connection');
            }
            req.payload = payload;
            next();
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userId,
            }
            const secret = process.env.JWTRSECURITYKEYREFRESH;
            const options = {
                expiresIn: "1d",
                issuer: "leadqart.com",
                // audience: userId,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if(err){
                    reject(err);
                }
                resolve(token);
            })
        })
    },
    verifyRefreshToken: (refreshtoken) => {
        return new Promise((resolve, reject) => {
            if(!refreshtoken){
                reject('Unauthorised')
            }
            const token = refreshtoken;
            JWT.verify(token,process.env.JWTRSECURITYKEYREFRESH,(err,payload) => {
                if(err) {
                    reject('Unauthorised')
                }
                resolve(payload.id);
            })
        })
    },
}