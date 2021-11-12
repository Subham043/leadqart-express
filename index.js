require('dotenv').config()
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser')
const ejs = require('ejs');
const helmet = require("helmet");
const hpp = require('hpp');
const cors = require('cors');
const { limiter } = require('./middleware/rate-limiter');
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 8081;
//model-connection
require('./model/connection');

app.use(fileUpload());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: false })); //Parse URL-encoded bodies
app.use(helmet());
app.use(hpp());
app.use(cookieParser())
//  apply to all requests
app.use(limiter);

//cors
// const whitelist = ['http://example1.com', 'http://example2.com']
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions))
app.use(cors())

//view engine
app.set('views', path.join(__dirname, 'view'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

//controller-routes
let authController = require('./controller');
app.use('/', authController);
let facebookController = require('./controller/facebook');
app.use('/facebook', facebookController);
let leadController = require('./controller/leads');
app.use('/leads', leadController);
let groupController = require('./controller/groups');
app.use('/groups', groupController);
let leadGroupController = require('./controller/leadGroup');
app.use('/lead-group', leadGroupController);
let followUpController = require('./controller/follow');
app.use('/follow-up', followUpController);
let contentMessage = require('./controller/contentMessage');
app.use('/content-message', contentMessage);
let contentFile = require('./controller/contentFile');
app.use('/content-file', contentFile);
let contentPage = require('./controller/contentPage');
app.use('/content-page', contentPage);
let Activity = require('./controller/activity');
app.use('/activity', Activity);


app.listen(port,()=>{
    console.log(`Apps is running on port: ${port}`);
})