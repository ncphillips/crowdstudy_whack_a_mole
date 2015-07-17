/* jslint node: true */
'use strict';

var config = require('./config');
var log = global.log;

module.exports.experiment = function (req, res) {
  res.render('index', {});
};

module.exports.experiment_name = function (req, res, next) {
  req.experiment_name = 'wack_a_mole';
  next();
};

module.exports.hook_worker_registration = function (req, res, next) {
  var workers = req.db.collection('workers');
  workers.find({"experiments.wack_a_mole.completed": {$in: [true, 'true']}}, function (err, workers) {
    var feedback_type = 'none';
    var count = 0;
    if (err) {
      console.log(err);
    }
    else if (workers){
      count = workers.length;
      if (count > 10) {
        feedback_type = config.feedback.types[count % 2];
      }
      req.workers = workers;
    }
    req.experiment.feedback_type = feedback_type;
    next();
  });
};

module.exports.generate_stats = function (req, res, next) {
  req.stats = {};
  switch (req.experiment.feedback_type) {
    case config.NONE:
      real_stats(req, res, next);
      break;
    case config.REAL:
      real_stats(req, res, next);
      break;
    case config.FAKE:
      fake_stats(req, res, next);
      break;
    default:
      next();
      break;
  }
};



var real_stats = function (req, res, next) {
  var wamstats = require('./public/scripts/lib/wamstats');
  var workers = req.db.collection('workers');
  workers.find({"experiments.wack_a_mole.data": {"$exists": true}}).toArray(function (err, workers) {
    if (err) {
      return next(err);
    } else if (!workers) {
      workers = [];
    }

    req.stats = {
      population_average: wamstats.wamstats.generatePopulationAverageStats(workers),
      population_elite: wamstats.wamstats.generatePopulationEliteStats(workers)
    };
    log(req.stats);
    next();
  });
};
exports.real_stats = real_stats;

var fake_stats = function (req, res, next) {
  next();
};
exports.fake_stats = fake_stats;

exports.returnStats = function (req, res) {
  res.json(req.stats);
};

function mean(num_array){
  var total = 0;
  num_array.forEach(function (value) {
    total += value;
  });
  return total / num_array.length;
}