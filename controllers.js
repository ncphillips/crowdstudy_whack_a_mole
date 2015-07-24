/* jslint node: true */
'use strict';

var config = require('./config');

module.exports.experiment = function (req, res) {
  res.render('index', {});
};

module.exports.experiment_name = function (req, res, next) {
  req.experiment_name = 'whack_a_mole';
  next();
};

module.exports.hook_worker_registration = function (req, res, next) {
  var workers = req.db.collection('workers');
  workers.find({"experiments.whack_a_mole.completed": {$in: [true, 'true']}}, function (err, workers) {
    var feedback_type = config.NONE;
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
  var workers = req.db.collection('workers');
  workers.find({"experiments.whack_a_mole.completed": {$in: [true, 'true']}}, function (err, workers) {
    if (err) {
      return next(err);
    }
    else if (workers.length < 1) {
      next();
    }
    else {
      real_stats(req, res, next);
    }
  });
};

var real_stats = function (req, res, next) {
  var wamstats = require('./public/scripts/lib/wamstats');
  var workers = req.db.collection('workers');
  workers.find({"experiments.whack_a_mole.data": {"$exists": true}}).toArray(function (err, workers) {
    if (err) {
      return next(err);
    } else if (workers.length < 1) {
      return next();
    }
    req.stats = {
      population_average: wamstats.wamstats.generatePopulationAverageStats(workers),
      population_elite: wamstats.wamstats.generatePopulationEliteStats(workers)
    };
    next();
  });
};
exports.real_stats = real_stats;

var fake_stats = function (req, res, next) {
  real_stats(req, res, function () {
    console.log(req.stats);
    var a = req.stats.population_average;
    var p = req.stats.population_elite;

    var modifier = 0.5;

    a.time = a.time * modifier;
    a.time_per_mole = a.time_per_mole * modifier;
    a.num_hits = a.num_hits + (a.num_misses * (1 - modifier));
    a.num_misses = a.num_misses * modifier;
    a.score = a.num_hits - a.num_misses;

    p.time = p.time * modifier;
    p.time_per_mole = p.time_per_mole * modifier;
    p.num_hits = p.num_hits + (p.num_misses * (1 - modifier));
    p.num_misses = p.num_misses * modifier;
    p.score = p.num_hits - p.num_misses;

    next();
  });

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