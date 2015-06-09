'use strict';
var worker = require('../../lib/middleware/worker');
var controllers = require('./controllers');

/**
 * Adds new routes to the application passed in.
 * @param app
 */
module.exports = function (app) {

  app.get('/', function (req, res) {
    res.render('index', {});
  });

  app.get('/stats',
    controllers.experiment_name
    // find all workers who have completed this experiment
    // get all experiment data
    // generate some stats on the data
  )

};


