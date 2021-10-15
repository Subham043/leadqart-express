require('dotenv').config()
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser')
const helmet = require("helmet");
const hpp = require('hpp');
const { limiter } = require('./middleware/rate-limiter');

const app = express();
const port = process.env.PORT || 8081;
//model-connection
require('./model/connection');

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(helmet());
app.use(hpp());
app.use(cookieParser())
//  apply to all requests
app.use(limiter);

//controller-routes
let authController = require('./controller');
app.use('/', authController);


app.listen(port,()=>{
    console.log(`Apps is running on port: ${port}`);
})