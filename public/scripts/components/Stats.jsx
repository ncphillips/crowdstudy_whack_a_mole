var Questions = require('./Questions');

var Row = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.props.data.num_hits}</td>
        <td>{this.props.data.num_misses}</td>
        <td>{this.props.data.score}</td>
        <td>{Math.round(this.props.data.mean_time_to_hit) / 1000}</td>
      </tr>
    );
  }
});
var StatsView = React.createClass({
  render: function () {
    var worker_stats = <Row name="You" data={this.props.stats}/>;
    var comparison_stats = null;

    if (Object.getOwnPropertyNames(this.state.cstats).length > 1) {
      comparison_stats = <Row name="Avg." data={this.state.cstats}/>;
    }
    return (
      <div>
        <h2>Feedback</h2>
        <table className="table">
          <thead>
            <tr>
              <td>Name</td>
              <td>&#35; hits</td>
              <td>&#35; misses</td>
              <td>Score</td>
              <td>Reaction Time (seconds)</td>
            </tr>
          </thead>
          <tbody>
            {worker_stats}
            {comparison_stats}
          </tbody>
        </table>
        <Questions callback={this.props.callback}/>
      </div>
    )
  },
  componentDidMount: function () {
    $.ajax({
      type: 'GET',
      url: '/wack_a_mole/' + this.props.worker._id + '/stats',
      dataType: 'json',
      success: this.setComparisonStats,
      error: function (a, b, c) {
        console.log(a, b, c);
      }
    });
  },
  getInitialState: function () {
    return {
      cstats: {}
    };
  },
  setComparisonStats: function (cstats) {
    console.log("Wooo!", cstats);
    this.setState({cstats: cstats});
  }

});

module.exports = StatsView;