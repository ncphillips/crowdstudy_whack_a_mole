'use strict';
var CrowdExperiment = require('CrowdExperiment');
var Field = require('./components/Field');
var DIMENSIONS = [3, 3];
var HIT = 2;
var MISS = -1;
var DOWN = -2
var WAIT_TIMES = [];

for (var i = 1; i <= 10; i++) {
  WAIT_TIMES.push({low: 4 - ((i/3) - 1), high: 4 - ((i/3) - 1) + (i % 3)});
}

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var WackAMoleApp = React.createClass({
  render: function () {
    var field = null;
    if (this.state.round.number >= 0) {
      field = (<Field dimensions={this.props.settings.dimensions} row={this.state.round.mole_row} patch={this.state.round.mole_col} hit={this.moleHit} miss={this.moleMiss}/>);
    };

    return (
      <div>
        <h2>Wack-A-Mole</h2>
        <p>You have {this.props.settings.wait_times.length} chances to wack that mole!</p>
        <ul>
          <li>{HIT} points for every mole wacked!</li>
          <li>{MISS} points for each wack that misses!</li>
          <li>{DOWN} points for each mole that hides before you wack them!</li>
        </ul>
        <p><b>Score: </b>{this.state.round.score}</p>
        <input type="btn" className="btn btn-primary" value="Start!" onClick={this.startRound} disabled={this.state.round.number >= 0}/>
      {field}
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
      data: [],
      round: {
        number: -1,
        score: 0, // moleHit, moleMiss, moleDown
        hit: null, // moleHit, moleDown
        time_end: null, // moleHit, moleDown
        time_interval: null, // moleUp
        time_start: null, // moleUp
        mole_bounds: null, // moleUp
        mole_row: 0, // moleBurrow
        mole_col: 0, // moleBurrow
        mouse_start: null, // moleUp
        mouse_end: null, // moleHit, moleDown
        mouse_misses: [] // moleMiss
      }
    }
  },

  /**
   * Start Round
   */
  startRound: function () {
    console.log("startRound");
    var next_round = this.state.round.number + 1;

    if (next_round >= this.props.settings.wait_times.length) {
      this._exit(this.state.data);
    }
    else {
      var new_state = this.state;
      new_state.round.number = next_round;
      this.setState(new_state, this.moleBurrow);
    }
  },

  /**
   * Mole Up
   */
  moleBurrow: function () {
    console.log("moleBurrow");
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var wait = this.props.settings.wait_times[this.state.round.number];
    var time_interval = getRandomInt(wait.low, wait.high) * 1000;
    var state = this.state;
    state.round.mole_row = 0; // Mole Disapears.
    state.round.mole_col = 0;
    state.round.timeout_id = setTimeout(this.moleUp, time_interval);
    this.setState(state);
  },

  /**
   * Mole UP
   */
  moleUp: function () {
    console.log("moleUp");
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }

    var wait = this.props.settings.wait_times[this.state.round.number];
    var time_interval = getRandomInt(wait.low, wait.high) * 1000;
    var state = this.state;
    state.round.mole_row = getRandomInt(1, this.props.settings.dimensions[0]);
    state.round.mole_col = getRandomInt(1, this.props.settings.dimensions[1]);
    state.round.mole_bounds = null;
    state.round.mouse_start = null;
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
    console.log("moleMiss");
    var state = this.state;
    var misses = this.state.round.mouse_misses;
    misses.push({x: e.clientX, y: e.clientY, time: e.timeStamp});
    state.round.score = state.round.score + MISS;
    state.round.mouse_misses = misses;
    this.setState(state);
  },

  /**
   * Mole Hit
   * @param e
   */
  moleHit: function (e) {
    console.log("moleHit");
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var state = this.state;
    state.round.score = this.state.round.score + HIT;
    state.round.hit = true;
    state.round.time_end = e.timeStamp;
    state.round.mouse_end = [e.clientX, e.clientY];
    this.setState(state, this.endRound);
  },

  /**
   * Mole Down
   * @param hit
   */
  moleDown: function (hit) {
    console.log("moleDown");
    if (this.state.round.timeout_id) {
      clearTimeout(this.state.round.timeout_id);
    }
    var state = this.state;
    state.round.score = state.round.score + DOWN;
    state.round.hit = false;
    state.round.time_end = state.round.time_start + state.round.time_interval;
    state.round.mouse_end = null;
    this.setState(state, this.endRound);
  },

  /**
   * End Round
   */
  endRound: function () {
    console.log("endRound");
    var round = this.state.round;
    var experiment_data = this.state.data;
    var d = {
      number: round.number,
      score: round.score,
      hit: round.hit,
      time_end: round.time_end,
      time_interval: round.time_interval,
      time_start: round.time_start,
      mole_bounds: round.mole_bounds,
      mole_row: round.mole_row,
      mole_col: round.mole_col,
      mouse_start: round.mouse_start,
      mouse_end: round.mouse_end,
      mouse_misses: round.mouse_misses
    };

    experiment_data.push(d);

    this.setState({
      data: experiment_data
    }, this.startRound);
  },
  _exit: function () {
    var output = {
      rounds: this.state.data,
      num_hits: 0,
      num_misses: 0,
      score: this.state.data[this.state.data.length - 1].score,
      mean_time_to_hit: 0
    };
    var sum_time_to_hit = 0;
    output.rounds.forEach(function (round) {
      output.num_hits   += round.hit ? 1 : 0;
      output.num_misses += round.mouse_misses.length + (round.hit ? 0 : 1);
      if (round.hit){
        sum_time_to_hit += (round.time_end - round.time_start);
      }
    });

    output.mean_time_to_hit = sum_time_to_hit / output.num_hits;

    this.props.exit(output);
  }
});

React.render(
  <CrowdExperiment experiment_name="wack_a_mole" experiment_app={WackAMoleApp}/>,
  document.getElementById('wack-a-mole')
);