// const allowedOrigins = require('../config').allowedOrigins;
const express = require('express');
const bodyParser = require('body-parser');
/* initialize models */
require('../db/models/Client');
require('../db/models/User');
require('../db/models/Blacklist');
const { cors, clientAPIKeyValidation } = require('./middlewares');

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

/*  Mandatory Set Up */
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors);
const generateAPIKey = require('../routes/generateAPIKey');
generateAPIKey(app);

/* public api which don't need apikey */
const authorize = require('../routes/authorize');
authorize(app);

/* Service */
app.use(clientAPIKeyValidation);

// routes
const helloWorld = require('../routes/helloWorld');
helloWorld(app);
const signUp = require('../routes/signUp');
signUp(app);

module.exports = app;