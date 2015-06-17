'use strict';
var worker = require('../worker/controllers');
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
    workers.find({_id: ObjectId(id)}).toArray(function (err, workers) {
      if (err) return next(err);

      log.info(workers);
      if (workers.length < 1) return next(new Error('Failed to load Worker.'));

      req.worker = workers[0];
      next();
    });
  });

};


