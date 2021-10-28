const rateLimit = require("express-rate-limit");

//https://www.npmjs.com/package/express-rate-limit -> limiter docs
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    statusCode: 200,
    message:{
        rateLimit:"Too many requests from this IP, please try again after fifteen minutes"
    }
});

const AuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 100 requests per windowMs
    statusCode: 200,
    message:{
        rateLimit:"Too many request from this IP, please try again after an hour"
    }
});

module.exports = {
    limiter,
    AuthLimiter
}