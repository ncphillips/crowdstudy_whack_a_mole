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

// Rounds
var STATS_INTERVAL = 10;

var WAIT_TIMES = [];
for (var i = 1; i <= 50; i++) {
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

var WackAMoleApp = React.createClass({
  render: function () {
    var display = null;
    if (this.state.round.number > 0 && this.state.round.number % STATS_INTERVAL === 0) {
      display = (<StatsView worker={this.props.worker} round={this.state.round.number} stats={this._stats()} callback={this.saveQuestion} />);
    }
    else if (this.state.round.number >= 0) {
      var dim = this.props.settings.dimensions;
      var row = this.state.round.mole_row;
      var col = this.state.round.mole_col;
      var hcb = this.moleHit;
      var mcb = row !== 0 ? this.moleMiss : function () {};

      display = (<Field dimensions={dim} row={row} patch={col} hit={hcb} miss={mcb}/>);
    }
    else {
      display = <Instructions rounds={WAIT_TIMES.length} interval={STATS_INTERVAL} hit={HIT} miss={MISS} down={DOWN}/>;
    }

    var button = this.state.round.number >= 0 ? null: <input type="btn" className="btn btn-block btn-primary" value="Start!" onClick={this.startGame} disabled={this.state.round.number >= 0}/>

    return (
      <div>
        <br/>
        <FullScreenButton fullscreen={this.state.fullscreen} callback={this.toggleFullScreen}></FullScreenButton>
        <h2>Wack-A-Mole</h2>
        <h3>Score: {this.state.round.score}</h3>
        {display}
        {button}
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
        wait_times: WAIT_TIMES
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
      fullscreen: false,
      questions: [],
      data: [],
      round: {
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
      }
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
      this.startRound();
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

    if (next_round > 0 && next_round % STATS_INTERVAL === 0 ){
      new_state.round.number = next_round;
      this.setState(new_state);
    }
    else if (next_round >= this.props.settings.wait_times.length) {
      this._exit(this.state.data);
    }
    else {
      new_state.round.number = next_round;
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
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var mole = document.getElementsByClassName('mole-patch')[0];
    var state = this.state;
    state.round.score = state.round.score + MISS;
    state.round.hit = false;
    state.round.mole_rect = mole.getClientRects()[0];
    state.round.time_end = e.timeStamp;
    state.round.mouse_end = [e.clientX, e.clientY];
    this.setState(state, this.endRound);
  },

  /**
   * Mole Hit
   * @param e
   */
  moleHit: function (e) {
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var mole = document.getElementsByClassName('mole-patch')[0];
    var state = this.state;
    state.round.score = this.state.round.score + HIT;
    state.round.hit = true;
    state.round.mole_rect = mole.getClientRects()[0];
    state.round.time_end = e.timeStamp;
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
    state.round.time_end = state.round.time_start + state.round.time_interval;
    state.round.mouse_end = [mouseX, mouseY];
    this.setState(state, this.endRound);
  },

  /**
   * End Round
   */
  endRound: function () {
    var round = this.state.round;
    var experiment_data = this.state.data;
    var d = {
      number: round.number,
      score: round.score,
      hit: round.hit,
      time_end: round.time_end,
      time_interval: round.time_interval,
      time_start: round.time_start,
      mole_rect: round.mole_rect,
      mole_row: round.mole_row,
      mole_col: round.mole_col,
      mouse_start: round.mouse_start,
      mouse_end: round.mouse_end,
      mouse_misses: round.mouse_misses || []
    };

    experiment_data.push(d);

    this.setState({
      data: experiment_data
    }, this.startRound);
  },
  saveQuestion: function (q) {
    var questions = this.state.questions;
    questions.push(q);

    this.setState({questions: questions}, this.startRound);
  },
  _stats: function () {
    var stats = {
      rounds: this.state.data,
      num_hits: 0,
      num_misses: 0,
      score: this.state.data[this.state.data.length - 1].score,
      mean_time_to_hit: 0
    };
    var sum_time_to_hit = 0;
    stats.rounds.forEach(function (round) {
      stats.num_hits   += round.hit ? 1 : 0;
      stats.num_misses += round.hit ? 0 : 1;
      if (round.hit){
        sum_time_to_hit += (round.time_end - round.time_start);
      }
    });

    stats.mean_time_to_hit = sum_time_to_hit / stats.num_hits;
    return stats;
  },
  _exit: function () {
    var output = this._stats();
    output.rounds = this.state.data;
    output.questions = this.state.questions;

    this.props.exit(output);
  }
});



React.render(
  <CrowdExperiment experiment_name="wack_a_mole" experiment_app={WackAMoleApp}/>,
  document.getElementById('wack-a-mole')
);