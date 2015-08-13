/* jslint node: true */
var constants = {
  NONE: 'None',
  REAL: 'Real',
  FAKE_WORKER_IS_BETTER: 'Fake (Better)',
  FAKE_WORKER_IS_WORSE: 'Fake (Worse)'
};

var config = {
  feedback_type: constants.NONE,
  stats_query: {
    "experiments.whack_a_mole.feedback_type": constants.NONE,
    "experiments.whack_a_mole": { $exists: true },
    "experiments.whack_a_mole.completed": {$in: [true, "true", "True", "TRUE"]},
    "experiments.whack_a_mole.blocks": { $exists: true, $not: { $size: 0 } }
  },
  fake_stats_modifiers: {
    better: { avg: 1.25, elite: 1.10 },
    worse:  { avg: 0.90, elite: 0.75 }
  },
  constants: constants
};


module.exports = config;
