'use strict';

//var React = require('react');

var Instructions = React.createClass({
  render: function () {
    return (
      <div>
        <p>Each round you have {this.props.rounds} chances to whack a mole!</p>
        <p>After every {this.props.interval} moles you will receive feedback and be asked some questions. Please answer these accurately and truthfully as you can. Your answers will be verified before your bonus is awarded.</p>
        <p>Your goal is to click the moles as quickly and accurately as possible!</p>
        <p>The game scoring works in the following way:</p>
        <ul>
          <li>{this.props.hit} points for every mole whacked!</li>
          <li>{this.props.miss} points for each whack that misses!</li>
          <li>{this.props.down} points for each mole that hides before you whack them!</li>
        </ul>
        <p>Please click the 'Enter Full-Screen' button above to get started.</p>
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
