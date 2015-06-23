"use strict";

//var React = require('react');

function toggleFullscreen() {
  if (!document.fullscreenElement &&    // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

var FullScreenButton = React.createClass({
  render: function () {
    var text = this.props.fullscreen ? "Exit Full-Screen" : "Please Enter Full-Screen";
    return (
      <input type="button" className="btn btn-block btn-default" onClick={this._clickFullScreen} value={text}/>
    );
  },
  _clickFullScreen: function (e) {
    toggleFullscreen();
  }
});



if (typeof module !== 'undefined') {
  module.exports = FullScreenButton;
}
