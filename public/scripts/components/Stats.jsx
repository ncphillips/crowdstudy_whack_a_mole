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
    workers_last: "Your Last Round",
    workers_average: "Your Average Round",
    elite_workers: "Expert Worker's Round",
    average_workers: "Average Worker's Round"
  },
  col: {
    time: 'Time',
    num_hits: "# Hits",
    num_misses: "# Misses",
    score: "Score",
    time_per_mole: "Time/Mole"
  }
};

if (typeof require !== 'undefined') {
  var Questions = require('./Questions');
}

var StatsRow = React.createClass({
  render: function () {
    var h = 'success';
    var l = 'danger';
    console.log("Stats row data:", this.props.data);
    var classes = {
      time: 'active',
      num_hits: 'active',
      num_misses: 'active',
      score: 'active',
      time_per_mole: 'active'
    };
    if (this.props.colorCells){
      classes.time = this.props.data.time > 0 ? h : l;
      classes.num_hits = this.props.data.num_hits > 0 ? h : l;
      classes.num_misses = this.props.data.num_misses < 0 ? h : l;
      classes.score = this.props.data.score > 0 ? h : l;
      classes.timer_per_mole = this.props.data.time_per_mole < 0 ? h : l;
    }
    return (
      <tr className={this.props.className}>
        <td><span data-toggle="tooltip" data-placement="left" title={this.props.tooltip}>{this.props.name}</span></td>
        <td className={classes.time}>{Math.round(this.props.data.time / 100)/10} sec.</td>
        <td className={classes.time_per_mole}>{Math.round(this.props.data.time_per_mole / 10 ) / 100} sec.</td>
        <td className={classes.num_misses}>{Math.round(this.props.data.num_misses * 10)/10}</td>
        <td className={classes.num_hits}>{Math.round(this.props.data.num_hits * 10)/10}</td>
        <td className={classes.score}>{Math.round(this.props.data.score * 10)/10}</td>
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
    var worker_stats = <StatsRow key={"worker"} name={LABELS.row.workers_last} data={this.props.stats.last_block} tooltip={TOOLTIPS.row.you}/>;
    var worker_avg_stats = null;
    if (this.props.stats.average_block) {
      worker_avg_stats = <StatsRow key={"worker avg."} name={LABELS.row.workers_average} data={this.props.stats.average_block} tooltip={TOOLTIPS.row.you}/>;
    }
    var avg_worker_stats = null;
    var elite_worker_stats = null;
    var difference_of_stats = null;

    if (Object.getOwnPropertyNames(this.state.cstats).length > 1) {
      avg_worker_stats = <StatsRow key={"average"}name={LABELS.row.average_workers} data={this.state.cstats.population_average} tooltip={TOOLTIPS.row.average}/>;
      elite_worker_stats = <StatsRow key={"elite"} name={LABELS.row.elite_workers} data={this.state.cstats.population_elite} tooltip={TOOLTIPS.row.average}/>;
    }
    return (
      <div>
        <h3>Feedback Table</h3>
        <table className="table">
          <thead>
            <tr>
              <td></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.time}>{LABELS.col.time}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.time_per_mole}>{LABELS.col.time_per_mole}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.num_misses}>{LABELS.col.num_misses}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.num_hits}>{LABELS.col.num_hits}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.score}>{LABELS.col.score}</span></td>
            </tr>
          </thead>
          <tbody>
            {worker_stats}
            {worker_avg_stats}
            {avg_worker_stats}
            {elite_worker_stats}
          </tbody>
          <tfoot>
            {difference_of_stats}
          </tfoot>
        </table>
        <Questions callback={this._handleQuestions}/>
      </div>
    )
  },
  _handleQuestions: function (q) {
    this.props.callback({
      questions: q,
      stats: {
        worker: this.props.stats,
        population: this.state.cstats,
      }
    });
  },
  componentDidMount: function () {
    $.ajax({
      type: 'GET',
      url: '/whack_a_mole/' + this.props.worker._id + '/stats',
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
