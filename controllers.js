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
      next();
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
  var workers = req.db.collection('workers');
  workers.find({"experiments.wack_a_mole.data": {"$exists": true}}).toArray(function (err, workers) {
    if (err) return next(err);
    if (!workers) workers = [];
    var stats = {
      num_hits: 0,
      num_misses: 0,
      score: 0,
      mean_time_to_hit: 0,
      source: {
        num_hits: [],
        num_misses: [],
        score: [],
        mean_time_to_hit: []
      }
    };
    workers.forEach(function (worker, index) {
      var data =  worker.experiments.wack_a_mole.data;
      stats.source.num_hits.push(data.num_hits);
      stats.source.num_misses.push(data.num_misses);
      stats.source.score.push(data.score);
      stats.source.mean_time_to_hit.push(data.mean_time_to_hit);

      stats.num_hits += data.num_hits;
      stats.num_misses += data.num_misses;
      stats.score += data.score;
      stats.mean_time_to_hit =  parseFloat(data.mean_time_to_hit);
    });
    var count = workers.length || 1;
    stats.num_hits = stats.num_hits / count;
    stats.num_misses = stats.num_misses / count;
    stats.score = stats.score / count;
    console.log(stats.mean_time_to_hit);
    stats.mean_time_to_hit = stats.mean_time_to_hit / count;
    req.stats = stats;
    next();
  });
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