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

/**
 * @param req
 * @param res
 * @param next
 */
module.exports.hook_worker_registration = function (req, res, next) {
  req.experiment.blocks = [];
  req.experiment.feedback_type = config.feedback_type;
  next();
};

module.exports.generate_stats = function (req, res, next) {
  var sm = require('./middleware/stats');
  req.stats = {};
  req.block_num = req.experiment.blocks.length - 1;
  switch(req.experiment.feedback_type) {
    case config.constants.NONE:
      next();
      break;
    case config.constants.REAL:
      sm.real(req, res, next);
      break;
    case config.constants.FAKE_WORKER_IS_BETTER:
      sm.fake_better(req, res, next);
      break;
    case config.constants.FAKE_WORKER_IS_WORSE:
      sm.fake_worse(req, res, next);
      break;
    default:
      next();
      break;
  }
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