'use strict';

//var React = require('react');

// Components
if (typeof require !== 'undefined') {
  var FullScreenButton = require('./components/FullScreenButton');
  var CrowdExperiment = require('CrowdExperiment');
  var Field = require('./components/Field').Field;
  var Mole = require('./components/Field').Mole;
  var StatsView = require('./components/StatsView');
  var Instructions = require('./components/Instructions');
}

// Scoring Constants
var HIT = 1;
var MISS = -1;
var DOWN = -1;

// Field Dimensions
var DIMENSIONS = [3, 3];

// Blocks
var NUM_BLOCKS = 5;

// Rounds
var WAIT_TIMES = [];
for (var i = 1; i <= 10; i++) {
  WAIT_TIMES.push({low: 0.75, high: 2});
}

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var mouseX;
var mouseY;

document.onmousemove = function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
};

var WhackAMoleApp = React.createClass({
  render: function () {
    var button = this.state.round.number >= 0 ? null:
      (<input type="btn"
              className="btn btn-block btn-primary"
              value="Start!" onClick={this.startGame}
              disabled={this.state.round.number >= 0} />);
    var percentage_done = Math.round((this.state.block / this.props.settings.num_blocks) * 100);
    var style = {width: percentage_done.toString() + "%"};

    var display = null;

    switch (this.state.view) {
      case 'instructions':
        display = (<Instructions rounds={WAIT_TIMES.length} interval={this.props.settings.wait_times.length} hit={HIT} miss={MISS} down={DOWN}/>);
        break;
      case 'stats':
        display = (<StatsView worker={this.props.worker} block={this.state.block} stats={this._stats()} callback={this.saveQuestion} />);
        break;
      case 'game':
        var dim = this.props.settings.dimensions;
        var row = this.state.round.mole_row;
        var col = this.state.round.mole_col;
        var hcb = this.moleHit;
        var mcb = row !== 0 ? this.moleMiss : function () {};
        display = (<Field dimensions={dim} row={row} patch={col} hit={hcb} miss={mcb}/>);
        break;
    }

    return (
      <div>
        <div className="col-md-3"></div>
        <div className="col-md-6">
          <br/>
          <FullScreenButton fullscreen={this.state.fullscreen} callback={this.toggleFullScreen}></FullScreenButton>
          <br/>
          <div className="text-center">
            <p>You have completed {this.state.block} out of {this.props.settings.num_blocks} rounds!</p>
          </div>
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={style}> </div>
          </div>
          <h2 className="text-center">
            Whack-A-Mole<br/>
            <small style={{color: "green"}}> Score: {this.state.round.score || 0 } </small>
          </h2>
          {display}
          {button}
        </div>
        <div className="col-md-3"></div>
      </div>
    );
  },

  /**
   * SETUP
   */
  getDefaultProps: function () {
    return {
      exit: function () {
        console.log("No exit function provided");
      },
      settings: {
        dimensions: DIMENSIONS,
        wait_times: WAIT_TIMES,
        num_blocks: NUM_BLOCKS
      },
      worker: {
        id: '',
        _id: '',
        platform: ''
      }
    };
  },
  getInitialState: function () {
    return {
      view: 'instructions',
      fullscreen: false,
      questions: [],
      block: 0,
      blocks: [], // [ BLOCK, ], where BLOCK = [ROUND,]
      round: { }
    }
  },
  componentDidMount: function () {
    var screen_change_events = "webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange";
    var _this = this;
    $(document).on(screen_change_events, function () {
      _this.toggleFullScreen(!_this.state.fullscreen);
    });
  },
  componentWillUnmount: function () {
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
  },
  startGame: function () {
    if (this.state.fullscreen){
      // Create a new Block.
      ExperimentStore.get().blocks.push([]);

      // Update State
      var state= this.state;
      state.view = 'game';
      state.round = {
        number: -1,
        score: 0, // moleHit, moleMiss, moleDown
        hit: null, // moleHit, moleDown
        time_end: null, // moleHit, moleDown
        time_interval: null, // moleUp
        time_start: null, // moleUp
        mole_rect: null, // moleUp
        mole_row: 0, // moleBurrow
        mole_col: 0, // moleBurrow
        mouse_start: null, // moleUp
        mouse_end: null, // moleHit, moleDown
        mouse_misses: [] // moleMiss
      };
      this.replaceState(state, this.startRound);
    } else {
      alert("Please enter full-screen mode before starting.");
    }
  },
  toggleFullScreen: function (f) {
    this.setState({fullscreen: f});
  },
  /**
   * Start Round
   */
  startRound: function () {
    var next_round = this.state.round.number + 1;
    var new_state = this.state;

    if (next_round >= this.props.settings.wait_times.length) {
      this.endBlock();
    }
    else {
      new_state.round.number = next_round;
      new_state.hitting = false;
      this.setState(new_state, this.moleBurrow);
    }
  },

  /**
   * Mole Up
   */
  moleBurrow: function () {
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var wait = this.props.settings.wait_times[this.state.round.number];
    var time_interval = getRandomInt(wait.low, wait.high) * 1000;
    var state = this.state;
    state.round.mole_row = 0; // Mole Disapears.
    state.round.mole_col = 0;
    state.round.mouse_misses = [];
    state.round.timeout_id = setTimeout(this.moleUp, time_interval);
    this.setState(state);
  },

  /**
   * Mole UP
   */
  moleUp: function () {
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }

    var wait = this.props.settings.wait_times[this.state.round.number];
    var time_interval = getRandomInt(wait.low, wait.high) * 1000;
    var state = this.state;
    state.round.mole_row = getRandomInt(1, this.props.settings.dimensions[0]);
    state.round.mole_col = getRandomInt(1, this.props.settings.dimensions[1]);
    state.round.mouse_start = [mouseX, mouseY];
    state.round.time_start = Date.now();
    state.round.time_interval = time_interval;
    state.round.timeout_id = setTimeout(this.moleDown, time_interval);
    this.setState(state);
  },

  /**
   * Mole Miss
   * @param e
   */
  moleMiss: function (e) {
    var state = this.state;
    state.round.score = state.round.score + MISS;
    state.round.mouse_misses.push([e.clientX, e.clientY]);
    this.setState(state);
  },

  /**
   * Mole Hit
   * @param e
   */
  moleHit: function (e) {
    if (this.state.hitting) return null;
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var mole = document.getElementsByClassName('mole-patch')[0];
    var state = this.state;
    state.hitting = true;
    state.round.score = this.state.round.score + HIT;
    state.round.hit = true;
    state.round.mole_rect = mole.getClientRects()[0];
    state.round.mouse_end = [e.clientX, e.clientY];
    this.setState(state, this.endRound);
  },

  /**
   * Mole Down
   * @param hit
   */
  moleDown: function (hit) {
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var state = this.state;
    state.round.score = state.round.score + DOWN;
    state.round.hit = false;
    state.round.mouse_end = [mouseX, mouseY];
    this.setState(state, this.endRound);
  },

  /**
   * End Round
   */
  endRound: function () {
    var round = this.state.round;
    var blocks = ExperimentStore.get().blocks;
    var d = {
      block: this.state.block,
      number: round.number,
      score: round.score,
      hit: round.hit,
      time_end: Date.now(),
      time_interval: round.time_interval,
      time_start: round.time_start,
      mole_rect: round.mole_rect,
      mole_row: round.mole_row,
      mole_col: round.mole_col,
      mouse_start: round.mouse_start,
      mouse_end: round.mouse_end,
      mouse_misses: round.mouse_misses || []
    };

    // Push round data onto last block
    if (blocks.length - 1 < this.state.block) {
      blocks.push([])
    }
    blocks[this.state.block][round.number] = d;

    this.startRound();
  },
  saveQuestion: function (q) {
    var worker = WorkerStore.get();
    var experiment = ExperimentStore.get();
    var questions = this.state.questions || [];
    questions.push(q);
    experiment.stats_questions = questions;
    ExperimentActions.update(worker._id, 'whack_a_mole', experiment);
  },
  whatDoNext: function () {
    if (this.state.block >= this.props.settings.num_blocks) {
      this._exit();
    } else {
      this.startGame();
    }
  },
  endBlock: function () {
    if(this.state.block_ending) return null;
    this.setState({block_ending: true});
    var worker = WorkerStore.get();
    var experiment = ExperimentStore.get();
    ExperimentActions.update(worker._id, 'whack_a_mole', experiment);
    var _this = this;
    setTimeout(function () {
      _this.setState({block_ending: false, view: 'stats', block: _this.state.block+1});
    }, 500);

  },
  _stats: function () {
    var n = this.state.block;
    var blocks = [];
    var eblocks = ExperimentStore.get().blocks;
    for (var i=0; i < eblocks.length - 1; i++) {
      blocks.push(eblocks[i]);
    }
    var last_block = eblocks[eblocks.length - 1];

    var last_block_stats = wamstats.generateBlockStats(last_block);
    var average_block_stats = n > 2 ? wamstats.generateAverageStats(blocks) : null;

    return {last_block: last_block_stats, average_block: average_block_stats};
  },
  _exit: function () {

  }
});



React.render(
  <CrowdExperiment experiment_name="whack_a_mole" experiment_app={WhackAMoleApp}/>,
  document.getElementById('app')
);