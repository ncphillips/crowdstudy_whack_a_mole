'use strict';

var express = require('express');
var app = express();

// Tells the application to look for views in `./views` before looking in the global views folder..
app.set('views', __dirname+'/views');

// Static files are in ./public and are available at this route.
// Example:
//      <img src="/mole_0.jsx"/>
app.use(express.static(__dirname + '/public'));

// Loads this application's routes.
require('./routes.js')(app);

module.exports.app = app;