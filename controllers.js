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
    if (err) {  }
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
  if (!req.experiment.wack_a_mole || !req.experiment.wack_a_mole.completed) {
    next();
  }
  else switch (req.experiment.wack_a_mole.feedback_type) {
    case config.NONE:
      next(); // Done
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

exports.real_stats = real_stats = function (req, res, next) {
  var stats = {
    num_hits: 0,
    num_misses: 0,
    score: 0,
    mean_time_to_hit: 0
  };
  req.workers.forEach(function (worker, index) {
    stats.num_hits += worker.experiments.wack_a_mole.data.num_hits;
    stats.num_misses += worker.experiments.wack_a_mole.data.num_misses;
    stats.score += worker.experiments.wack_a_mole.data.score;
    stats.mean_time_to_hit += worker.experiments.wack_a_mole.data.mean_time_to_hit;
  });
  stats.num_hits = stats / req.workers.length;
  stats.num_misses = stats / req.workers.length;
  stats.score = stats / req.workers.length;
  stats.mean_time_to_hit = stats / req.workers.length;
  req.stats = stats;
  next();
};

exports.fake_stats = fake_stats = function (req, res, next) {
  next();
};

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