var statsandstones = (function () {
  "use strict";

  /**
   * This function aggregates a homogenous array of stats objects
   * by finding the mean value for each stats value.
   *
   * Each stats object must be a non-nested object with a Number value (int or float).
   *
   *
   * @param stats
   */
  function aggregateStats(stats) {
    var result = {};

    stats.forEach(function (stat) {
      for (var name in stat) {
        if (stat.hasOwnProperty(name)) {
          if (!result.hasOwnProperty(name)){
            result[name] = 0;
          }
          result[name] += parseInt(stat[name]) || 0;
        }
      }
    });

    for (var name in result) {
      if (result.hasOwnProperty(name)) {
        result[name] = result[name] / stats.length;
      }
    }
    return result;
  }

  /**
   * Sorts stats objects using Quick sort.
   *
   * @param stats
   * @param property_name
   * @param reverse
   * @returns {*}
   */
  function sortStats(stats, property_name, reverse) {
    if (typeof reverse === 'undefined') {
      reverse = false;
    }
    // Order these by the property_name;
    if (stats.length <= 1) {
      return stats;
    }

    var pivot = Math.floor((stats.length - 1) / 2);
    var val = stats[pivot];

    var less = [];
    var more = [];

    var stat;
    for (var i=0; i < pivot; i++) {
      stat = stats[i];
      if (reverse) {
        stat[property_name] < val[property_name] ? less.push(stat): more.push(stat);
      } else {
        stat[property_name] > val[property_name] ? less.push(stat): more.push(stat);
      }
    }

    for (i=pivot+1; i < stats.length; i++) {
      stat = stats[i];
      if (reverse) {
        stat[property_name] < val[property_name] ? less.push(stat): more.push(stat);
      } else {
        stat[property_name] > val[property_name] ? less.push(stat): more.push(stat);
      }
    }

    return (sortStats(less, property_name, reverse)).concat([val], sortStats(more, property_name, reverse));
  }

  return {
    aggregateStats: aggregateStats,
    sortStats: sortStats
  };

})();

var wamstats = (function () {
  "use strict";

  /**
   * Generates a stats object for a single Whack a Mole block.
   *
   * @param block
   * @returns {{time: number, time_per_mole: number, num_misses: number, misses_per_mole: number, num_hits: number, score: number}}
   */
  function generateBlockStats(block) {
    var stats = {
      rank: 0,
      time: 0,              // Total Time
      time_per_mole: 0,     // Time per X
      num_misses: 0,        // # Y
      misses_per_mole: 0,   // Y / X
      num_hits: 0,          // # Z
      score: 0              // Score
    };
    var sum_time_to_hit = 0;
    var sum_miss_on_mole = 0;
    block.forEach(function (round) {
      // Total Time
      var time = (round.time_end - round.time_start);
      stats.time += time;

      // Time per X
      //    Time per hit doesn't take into account rounds
      //    when the mole is not hit.
      sum_time_to_hit += (round.hit) ? time : 0;

      // # Y
      var num_misses = 0;
      num_misses += (round.hit) ? 0 : 1;
      num_misses += (round.mouse_misses) ? round.mouse_misses.length : 0;
      stats.num_misses += num_misses;

      // Y / X
      //    Misses per Mole doesn't take into account rounds
      //    when the mole is not hit.
      if (typeof round.hit !== 'boolean') {
        round.hit = (round.hit === 'true');
      }
      sum_miss_on_mole += (round.hit) ? num_misses : 0;

      // Num Hits
      stats.num_hits += (round.hit) ? 1 : 0;

    });
    stats.time_per_mole = sum_time_to_hit / stats.num_hits;
    stats.misses_per_mole = sum_miss_on_mole / stats.num_hits;
    stats.score = block[block.length - 1].score;
    stats.rank = stats.score / stats.time;
    return stats;
  }


  /**
   * Generates a single stats object, given an array of blocks.
   *
   * @param blocks
   * @returns {*}
   */
  function generateAverageBlockStats(blocks) {
    // Generate the stats object for every block.
    var block_stats = blocks.map(generateBlockStats);

    // Aggregate all block stats objects and return the result;
    return statsandstones.aggregateStats(block_stats);
  }

  function generatePopulationEliteStats(workers) {
    // Get the aggregated stats object for  a worker.
    var n = Math.ceil(workers.length * 0.15) || 1;
    var worker_average_stats = workers.map(function (worker) {
      return generateAverageBlockStats(worker.experiments.whack_a_mole.data.blocks);
    });
    var fastest_workers = statsandstones.sortStats(worker_average_stats, 'time', true);
    var scoriest_workers = statsandstones.sortStats(worker_average_stats, 'score');
    var elite_worker_stats = fastest_workers.splice(0, n).concat(scoriest_workers.splice(0, n));
    return statsandstones.aggregateStats(elite_worker_stats);
  }

  function generatePopulationAverageStats(workers) {
    var worker_average_stats = workers.map(function (worker) {
      return generateAverageBlockStats(worker.experiments.whack_a_mole.data.blocks);
    });

    return statsandstones.aggregateStats(worker_average_stats);

  }

  return {
    generateBlockStats: generateBlockStats,
    generateAverageStats: generateAverageBlockStats,
    generatePopulationAverageStats: generatePopulationAverageStats,
    generatePopulationEliteStats: generatePopulationEliteStats
  };
})();

if (typeof module !== 'undefined') {
  module.exports.wamstats = wamstats;
  module.exports.statsandstones = statsandstones;
}
