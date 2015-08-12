/* jslint node: true */
"use strict";
var config = require('../config');
var wamstats = require('../public/scripts/lib/wamstats');

module.exports = {
  real: function (req, res, next) {
    var workers = req.db.collection('workers');
    workers.find(config.stats_query).toArray(function (err, workers) {
      if (err) {
        return next(err);
      } else if (workers.length < 1) {
        return next();
      }
      // Only works if called twice for some reason....it work, don't know why...
      req.stats.population_average = wamstats.wamstats.generatePopulationAverageStats(workers, req.block_num);
      req.stats.population_average = wamstats.wamstats.generatePopulationAverageStats(workers, req.block_num);

      req.stats.population_elite = wamstats.wamstats.generatePopulationEliteStats(workers, req.block_num);
      next();
    });
  },
  fake_better: function (req, res, next) {
    var w = wamstats.wamstats.generateBlockStats(req.experiment.blocks[req.block_num]);
    var avg_modifier = config.fake_stats_modifiers.better.avg;
    var elite_modifier = config.fake_stats_modifiers.better.elite;

    req.stats.population_average = {};
    req.stats.population_average.time = w.time * avg_modifier;
    req.stats.population_average.time_per_mole = w.time_per_mole * avg_modifier;
    req.stats.population_average.num_hits = w.num_hits + (w.num_hits * (1 - avg_modifier));
    req.stats.population_average.num_misses = w.num_misses * avg_modifier;
    req.stats.population_average.score = w.score - (w.score * (1 - avg_modifier));

    req.stats.population_elite = {};
    req.stats.population_elite.time = w.time * elite_modifier;
    req.stats.population_elite.time_per_mole = w.time_per_mole * elite_modifier;
    req.stats.population_elite.num_hits = w.num_hits + (w.num_hits * (1 - elite_modifier));
    req.stats.population_elite.num_misses = w.num_misses * elite_modifier;
    req.stats.population_elite.score = w.score - (w.score * (1 - elite_modifier));

    next();
  },
  fake_worse: function (req, res, next) {
    var w = wamstats.wamstats.generateBlockStats(req.experiments.blocks[req.block_num]);

    var avg_modifier = config.fake_stats_modifiers.worse.avg;
    var elite_modifier = config.fake_stats_modifiers.worse.elite;

    req.stats.population_average = {};
    req.stats.population_average.time = w.time * avg_modifier;
    req.stats.population_average.time_per_mole = w.time_per_mole * avg_modifier;
    req.stats.population_average.num_hits = w.num_hits + (w.num_hits * (1 - avg_modifier));
    req.stats.population_average.num_misses = w.num_misses * avg_modifier;
    req.stats.population_average.score = w.score - (w.score * (1 - avg_modifier));

    req.stats.population_elite = {};
    req.stats.population_elite.time = w.time * elite_modifier;
    req.stats.population_elite.time_per_mole = w.time_per_mole * elite_modifier;
    req.stats.population_elite.num_hits = w.num_hits + (w.num_hits * (1 - elite_modifier));
    req.stats.population_elite.num_misses = w.num_misses * elite_modifier;
    req.stats.population_elite.score = w.score - (w.score * (1 - elite_modifier));

    next();

  }
};
