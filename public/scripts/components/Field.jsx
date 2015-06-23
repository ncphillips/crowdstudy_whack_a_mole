'use strict';

//var React = require('react');


var Mole = React.createClass({
  render: function () {
    var img_src = "mole_0.png";
    return <img src={img_src} style={{position: "absolute", top: 15, left: 40, width: "120px", height: "120px", "z-index": 2}}/>
  }
});

var Patch = React.createClass({
  /**
   * The following code sections are commented out because of bugs that were introduced, and not resolved as a result of animating the moles.
   */
  render: function () {
    var child = null;
    var callback = this.props.miss;
    var className = 'empty-patch';

    if (this.props.has_mole) {
      //child = <Mole was_hit={this.state.hit} callback={this.props.hit.bind(null, this.state.event)} />;
      //callback = this.clickedyClack;
      child = <Mole />;
      callback = this.props.hit;
      className = 'mole-patch';
    }

    return (
      <td className={className} onClick={callback}>
        <div style={{position: "relative", width: "200px", height: "200px"}}>
          <img  src="background.png" style={{position: "absolute", top: 0, left: 0, width: "200px", height: "200px", "z-index": 0}}/>
          <img src="upper.png" style={{position: "absolute", top: 0, left: 0, width: "200px", height: "100px", "z-index": 1}}/>
          {child}
          <img src="lower.png" style={{position: "absolute", top: 100, left: 0, width: "200px", height: "100px", "z-index": 4}}/>
        </div>
      </td>
    );
  }
  //getInitialState: function () {
  //  return {
  //    hit: false,
  //    hit_shown: false,
  //    event: {}
  //  };
  //},
  //clickedyClack: function (e) {
  //  if (!this.state.hit_shown) {
  //    this.setState({hit:true, hit_shown: true, event: e});
  //  }
  //}
});

var Row = React.createClass({
  render: function () {
    var patches= [];
    for (var i=1; i <= this.props.dimensions[1]; i++){
      var has_mole = this.props.mole_patch === i;
      patches.push(
        <Patch {...this.props} key={i} has_mole={has_mole}></Patch>
      );
    }

    return <tr> {patches} </tr>;
  }
});

/**
 * A Field where a mole lives.
 *
 * Props:
 *    1. dimensions = [Number, Number]
 *    2. row = Number
 *    3. patch = Number
 *    4. hit = func
 *    5. miss = func
 */
var Field = React.createClass({
  render: function () {
    var rows = [];

    for (var i=1; i <= this.props.dimensions[0]; i++){
      var mole_patch = 0;
      if (this.props.row === i){
        mole_patch = this.props.patch;
      }

      rows.push(<Row {...this.props} key={i} mole_patch={mole_patch}/>);
    }
    return <div><table>{rows}</table></div>;
  }
});

if (typeof module !== 'undefined') {
  module.exports.Field = Field;
  module.exports.Mole = Mole
}
