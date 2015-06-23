'use strict';

//var React = require('react');

var Instructions = React.createClass({
  render: function () {
    return (
      <div>
        <h3>Instructions</h3>
        <p>You have {this.props.rounds} chances to wack a mole!</p>
        <p>Every {this.props.interval} rounds you will be given feedback on your performance.</p>
        <ul>
          <li>{this.props.hit} points for every mole wacked!</li>
          <li>{this.props.miss} points for each wack that misses!</li>
          <li>{this.props.down} points for each mole that hides before you wack them!</li>
        </ul>
      </div>
    );
  },
  getDefaultProps: function () {
    return {
      rounds: 0,
      interval: 5,
      hit: 1,
      miss: 0,
      down: -1
    }
  }
});

if (typeof module !== 'undefined') {
  module.exports = Instructions;
}
