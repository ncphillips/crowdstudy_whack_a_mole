var Row = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.props.data.num_hits}</td>
        <td>{this.props.data.num_misses}</td>
        <td>{this.props.data.score}</td>
        <td>{this.props.data.mean_time_to_hit}</td>
      </tr>
    );
  }
});
var StatsView = React.createClass({
  render: function () {
    var buttonDisabled = this.state.wait > 0;
    var buttonText = buttonDisabled ? "Continue in " + this.state.wait + " seconds." : "Continue";
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
              <td>Speed</td>
            </tr>
          </thead>
          <tbody>
            {worker_stats}
            {comparison_stats}
          </tbody>
        </table>
        <input type="button" className="btn btn-default" value={buttonText} disabled={buttonDisabled} onClick={this.props.callback}/>
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
    this._wait();
  },
  getInitialState: function () {
    return {
      wait: 5,
      cstats: {}
    };
  },
  setComparisonStats: function (cstats) {
    console.log("Wooo!", cstats);
    this.setState({cstats: cstats});
  },
  _wait: function () {
    var state = this.state;
    if (this.state.wait > 0) {
      setTimeout(this._wait, state.wait * 800);
      state.wait = state.wait - 1;
      this.setState(state);
    }
  }
});

module.exports = StatsView;