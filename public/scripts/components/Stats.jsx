'use strict';

//var React = require('react');
var TOOLTIPS = {
  row: {
    you: "Stats calculated about your performance so far in this game.",
    average: "The performance of the average worker so far in this game.",
    difference: "The difference between you and the average worker."
  },
  col: {
    num_hits: "The number of times you successfully hit the mole.",
    num_misses: "The number of times you missed the mol",
    score: "# hits - # misses",
    time_per_mole: "How long it took you to hit hte mole."
  }
};

var LABELS = {
  row: {
    worker: "You",
    average: "Avg.",
    diff: "Difference"
  },
  col: {
    num_hits: "# Hits",
    num_misses: "# Misses",
    score: "Score",
    time_per_mole: "Reaction Time"
  }
};

if (typeof require !== 'undefined') {
  var Questions = require('./Questions');
}

var StatsRow = React.createClass({
  render: function () {
    var h = 'success';
    var l = 'danger';
    var classes = {
      num_hits: 'active',
      num_misses: 'active',
      score: 'active',
      time_per_mole: 'active'
    };
    if (this.props.colorCells){
      classes.num_hits = this.props.data.num_hits > 0 ? h : l;
      classes.num_misses = this.props.data.num_misses < 0 ? h : l;
      classes.score = this.props.data.score > 0 ? h : l;
      classes.timer_per_mole = this.props.data.time_per_mole < 0 ? h : l;
    }
    return (
      <tr className={this.props.className}>
        <td><span data-toggle="tooltip" data-placement="left" title={this.props.tooltip}>{this.props.name}</span></td>
        <td className={classes.num_hits}>{Math.round(this.props.data.num_hits * 10)/10}</td>
        <td className={classes.num_misses}>{Math.round(this.props.data.num_misses * 10)/10}</td>
        <td className={classes.score}>{Math.round(this.props.data.score * 10)/10}</td>
        <td className={classes.time_per_mole}>{Math.round(this.props.data.time_per_mole) / 1000} seconds</td>
      </tr>
    );
  },
  getDefaultProps: function () {
    return {
      className: '',
      colorCells: false
    };
  }
});
var StatsView = React.createClass({
  render: function () {
    var worker_stats = <StatsRow key={"worker"} name="Last Round" data={this.props.stats.last_block} tooltip={TOOLTIPS.row.you}/>;
    var worker_avg_stats = null;
    if (this.props.stats.average_block) {
      worker_avg_stats = <StatsRow key={"worker avg."} name="Average Round" data={this.props.stats.average_block} tooltip={TOOLTIPS.row.you}/>;
    }
    var comparison_stats = null;
    var difference_of_stats = null;

    if (Object.getOwnPropertyNames(this.state.cstats).length > 1) {
      comparison_stats = <StatsRow key={"average"} name="Average" data={this.state.cstats} tooltip={TOOLTIPS.row.average}/>;
      var difference = {
        num_hits: this.props.stats.num_hits - this.state.cstats.num_hits,
        num_misses: this.props.stats.num_misses - this.state.cstats.num_misses,
        score: this.props.stats.score - this.state.cstats.score,
        time_per_mole: this.props.stats.time_per_mole - this.state.cstats.time_per_mole
      };
      difference_of_stats = <StatsRow key={"diff"} name="Difference" data={difference} tooltip={TOOLTIPS.row.difference} colorCells={true}/>;
    }
    return (
      <div>
        <h2>Feedback</h2>
        <table className="table">
          <thead>
            <tr>
              <td></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.num_hits}>{LABELS.col.num_hits}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.num_misses}>{LABELS.col.num_misses}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.score}>{LABELS.col.score}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.time_per_mole}>{LABELS.col.time_per_mole}</span></td>
            </tr>
          </thead>
          <tbody>
            {worker_stats}
            {worker_avg_stats}
            {comparison_stats}
          </tbody>
          <tfoot>
            {difference_of_stats}
          </tfoot>
        </table>
        <Questions callback={this.props.callback}/>
      </div>
    )
  },
  componentDidMount: function () {
    $.ajax({
      type: 'GET',
      url: '/wack_a_mole/' + this.props.worker._id + '/stats?num_rounds=' + this.props.round,
      dataType: 'json',
      success: this.setComparisonStats,
      error: function (a, b, c) {
        console.log(a, b, c);
      }
    });
    $('[data-toggle="tooltip"]').tooltip();
  },
  getInitialState: function () {
    return {
      cstats: {}
    };
  },
  setComparisonStats: function (cstats) {
    this.setState({cstats: cstats});
  }

});

if (typeof module !== 'undefined') {
  module.exports = StatsView;
}
