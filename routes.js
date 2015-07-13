/* jslint node: true */
'use strict';
<<<<<<< HEAD
=======

>>>>>>> 28f5e58873dcc217a9eced77040bdea2f0c755ff
var log = global.log;
var worker = require('crowdstudy_worker').controllers;
var controllers = require('./controllers');

/**
 * Adds new routes to the application passed in.
 * @param app
 */
module.exports = function (app) {

  app.get('/', controllers.experiment);

  app.get('/:id/stats',
    controllers.experiment_name,
    worker.getExperiment,
    controllers.generate_stats,
    controllers.returnStats
  );

  app.param('id', function (req, res, next, id) {
    var ObjectId = require('mongodb').ObjectID;
    var workers = req.db.collection('workers');
<<<<<<< HEAD
    workers.find({_id: ObjectId(id)}).toArray(function (err, workers) {
      if (err) {
        return next(err);
      }
      else if (workers.length < 1) {
=======

    workers.find({_id: new ObjectId(id)}).toArray(function (err, workers) {
      if (err) {
        return next(err);
      }

      if (workers.length < 1) {
>>>>>>> 28f5e58873dcc217a9eced77040bdea2f0c755ff
        return next(new Error('Failed to load Worker.'));
      }

      req.worker = workers[0];
      next();
    });
  });
};


