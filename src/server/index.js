'use strict';
/**
* @description Connecting Express, Middleware and other dependences.
*/
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/**
* @description Setup empty JS object to act as endpoint for all routes.
*/
// let projectData = {};

/**
* @description Creating an instance of the app.
*/
const app = express();

/* Middleware*/
/**
* @description Here we are configuring express to use body-parser as middle-ware.
*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
* @description Connecting Cors for cross origin allowance.
*/
app.use(cors());

/**
* @description Initialize the main project folder.
*/
app.use(express.static('dist'));

/**
* @description Route for opening the main page of the app.
*/
app.get('/', function (req, res) {
    res.sendFile(path.resolve('dist/index.html'));
});

/**
* @description 
*/
app.post('/get', (request, response) => {

});

/**
* @description Setup Server.
*/
const port = process.env.NODE_ENV === 'development' ? 3030 : process.env.PORT ;
app.listen(port, listening);

function listening() {
    console.log('*************************************');
    console.log(` Your API id is: ${process.env.API_ID}`);
    console.log(` Your API key is: ${process.env.API_KEY}`);
    console.log(' Server started Successfully!');
    console.log(` Running on - http://localhost:${port}'`);
    console.log('=====================================');
    console.log(' To stop the server, Press - Ctrl+C');
    console.log('*************************************');
}

module.exports = app;