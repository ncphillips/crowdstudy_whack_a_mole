var resultsToCSV = (function () {
    "use strict";

    var COMPLETED = {
        //"experiments.wack_a_mole.completed": {
        //    $in: ["true", true]
        //},
        //"experiments.wack_a_mole.compelted": {$exists: true, $nin: [""]}
    };

    var TEST_IDS = [
        'nolan', 'scott-test', 'canuckeroo', 'nolan2', 'scott-test-2', 'nolan-test', 'nolan-test-2',
        'nolan-test-000'
    ];


    /**
     *
     * @type {Array}
     */
    var COLUMN_HEADERS = [
        'id', 'block', 'block__score', 'block__num_hits', 'block__num_misses', 'block__mean_time_to_hit'
    ];

    /**
     *
     * @type {{}}
     */
    var COLUMN_GENERATORS = {
        'id': function (worker) { return worker.id; },
        'block': function (worker, block_index) { return block_index; },
        'block__score': function (worker, block_index) {
            var rounds = worker.experiments.wack_a_mole[block_index];
            return rounds[rounds.length - 1].score;
        },
        'block__num_hits': function (worker, block_index) {
            var rounds = worker.experiments.wack_a_mole[block_index];
            var num_hits = 0;
            rounds.forEach(function (round) {
                num_hits += round.hit ? 1: 0;
            });
            return num_hits;
        },
        'block__num_misses': function (worker, block_index) {
            var rounds = worker.experiments.wack_a_mole[block_index];
            var num_misses = 0;

            rounds.forEach(function (round) {
                num_misses += round.hit ? 0: 1;
                num_misses += round.mouse_misses.length;
            });
        },
        'block__mean_time_to_hit': function (worker, block_index) {
            var rounds = worker.experiments.wack_a_mole[block_index];
            var sum_time_to_hit = 0;
            var num_hits = 0;
            rounds.forEach(function (round) {
                if (round.hit) {
                    num_hits += 1;
                    sum_time_to_hit += (round.time_start - round.time_end);
                }
            });
            return sum_time_to_hit / num_hits;
        }
    };


    function findAllCompletedWork(callback) {
        return db.workers.find(COMPLETED).toArray();
    }

    function generateRow() {
        var row = [];
        COLUMN_HEADERS.forEach(function (header) {
            row.push(COLUMN_GENERATORS[header].apply(null, arguments));
        });
        return row.join(';');
    }

    function generateSpreadsheet() {
        var spreadsheet = [COLUMN_HEADERS.join(';')];
        var workers = findAllCompletedWork();
        workers.forEach(function (worker) {
            if (worker.experiments && worker.experiments.wack_a_mole) {
                if (worker.experiments.wack_a_mole.data && worker.experiments.wack_a_mole.data.rounds) {
                    worker.experiments.wack_a_mole.data.rounds.map(function (block, block_index) {
                        spreadsheet.push(generateRow(worker, block_index));
                    });
                } else {
                    printjson([worker.id, ' NOT COMPLETED ', Object.getOwnPropertyNames(worker.experiments), worker.experiments.wack_a_mole]);
                }
            } else {
                print(worker.id, ' NOT COMPLETED ', Object.getOwnPropertyNames(worker.experiments));
            }
        });
        return spreadsheet;
    }

    function stringSpreadsheet() {
        return generateSpreadsheet().join('\r');
    }

    return stringSpreadsheet;
})();

print(resultsToCSV());
