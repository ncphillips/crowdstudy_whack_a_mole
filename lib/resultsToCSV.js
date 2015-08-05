var resultsToCSV = (function () {
    "use strict";

    var COMPLETED = {
        "experiments.whack_a_mole.completed": {
            $in: ["true", true]
        },
        "experiments.whack_a_mole.code": {$exists: true, $nin: [""]}
    };

    function findAllCompletedWork(callback) {
        return db.workers.find(COMPLETED).toArray();
    }


    function wamsheet(){
        var workers = findAllCompletedWork();
        var spreadsheet = [
          ['id', 'platform', 'feedback_type', 'block', 'round', 'time', 'errors', 'mole_clicked', 'distance', 'target_height', 'target_width',].join(', ')
        ];
        workers.forEach(function (worker) {
            worker.experiments.whack_a_mole.data.blocks.forEach(function (block, block_index) {
                block.forEach(function (round, round_index) {
                    var row = [];
                    // id
                    row.push(worker.id);
                    // platform
                    row.push(worker.platform);
                    // feedback_type
                    row.push(worker.experiments.whack_a_mole.feedback_type);
                    // block
                    row.push(block_index);
                    // round
                    row.push(round_index);
                    // time
                    row.push(round.time_end - round.time_start);
                    // errors
                    if (round.mouse_misses){
                        row.push(round.mouse_misses.length);
                    } else {
                        row.push(0);
                    }
                    // mole_clicked
                    row.push(round.hit?1:0);

                    // distance
                    var mole_right = parseInt(round.mole_rect.right);
                    var mole_left = parseInt(round.mole_rect.left);
                    var mole_top = parseInt(round.mole_rect.top);
                    var mole_bottom = parseInt(round.mole_rect.bottom);

                    var mole_width = (mole_right - mole_left);
                    var mole_height = (mole_bottom - mole_top);

                    var mx = mole_left + (mole_width/2);
                    var my = mole_top + (mole_height/2);

                    var dx = mx - round.mouse_start[0];
                    var dy = my - round.mouse_start[1];

                    row.push(Math.sqrt((dx*dx) + (dy*dy)));

                    // target_height
                    row.push(mole_width);
                    // target_width
                    row.push(mole_width);

                    spreadsheet.push(row.join(', '));
                });
            });
        });
        return spreadsheet;
    }

    function stringSpreadsheet() {
        return wamsheet().join('\r\n');
    }

    return stringSpreadsheet;
})();

print(resultsToCSV());
