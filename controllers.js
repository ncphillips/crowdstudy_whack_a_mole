'use strict';
var config = require('./config');

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
  var workers = req.db.collection('workers');
  workers.find({"experiments.wack_a_mole.data": {"$exists": true}}).toArray(function (err, workers) {
    if (err) {
      return next(err);
    } else if (!workers) {
      workers = [];
    }
    var nr = req.query.num_rounds;
    var stats = {
      num_hits: 0 ,
      num_misses: 0,
      score: 0,
      mean_time_to_hit: 0,
      sum_time_to_hit: 0
    };
    console.log("WORKERS: ", workers.length);
    workers.forEach(function (worker, index) {
      var rounds =   worker.experiments.wack_a_mole.data.rounds;
      var num = 0;

      if (!nr || nr >= rounds.length) {
        num = rounds.length;
      }
      else {
        num = nr;
      }
      var sum_time_to_hit = 0;
      for(var i=0; i < num; i++){
        stats.num_hits += rounds[i].hit ? 1: 0;
        stats.num_misses += rounds[i].hit ? 0: 1;
        sum_time_to_hit += (rounds[i].hit)? (rounds[i].time_end - rounds[i].time_start):0;
      }
      stats.mean_time_to_hit = sum_time_to_hit / num;
    });


    var count = workers.length || 1;
    stats.num_hits = stats.num_hits / count;
    stats.num_misses = stats.num_misses / count;
    stats.score = stats.num_hits - stats.num_misses;
    stats.mean_time_to_hit = stats.mean_time_to_hit / count;
    req.stats = stats;
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