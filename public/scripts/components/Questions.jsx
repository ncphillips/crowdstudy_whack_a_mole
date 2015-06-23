'use strict';

if (typeof require !== 'undefined') {
//var React = require('react');
  var WorkerStore = require('WorkerStore');
  var ExperimentStore = require('ExperimentStore');
}

var MIN_ANSWER_LENGTH = 3;

var props = {
  is_first_feedback: true
};
var _questions = {
  first_feedback_questions: [
    "Do you feel like you performed well?",
    "How many times did you miss?",
    "How many times did you hit?"
  ],
  other_feedback_questions: [
    "How many times did you miss?",
    "How many times did you hit?",
    "What was your reaction time?",
    "Has your reaction time improved?"
  ]
};

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var Questions = React.createClass({
  render: function () {
    var error = this.state.answerError;
    var areaClass = "form-group";
    var errorMessage = null;
    if (error) {
      errorMessage = (<div className="alert alert-danger" role="alert">{error}</div>);
      areaClass = "form-group has-error";
    }
    var buttonDisabled = this.state.wait > 0;
    var buttonText = buttonDisabled ? "Continue in " + this.state.wait + " seconds." : "Continue";

    return (
      <div>
        <p>{this.state.question}</p>
        <div className={areaClass}>
          <textarea id="answer" ref="answer" className="form-control"/>
        </div>
        <input type="button" className="btn btn-block btn-default" value={buttonText} disabled={buttonDisabled} onClick={this.saveAnswer}/>
        {errorMessage}
      </div>
    );
  },

  ///////////////////////
  // Lifecycle Methods //
  ///////////////////////
  getDefaultProps: function () {
    return props;
  },
  getInitialState: function () {
    return {
      wait: 5,
      question: '',
      answerError: '',
      worker: {},
      experiment: {}
    };
  },
  componentDidMount: function () {
    this.setState({
      worker: WorkerStore.get(),
      experiment: ExperimentStore.get()
    }, this.setQuestion);
    this._wait();
  },
  ////////////
  // Others //
  ////////////
  setQuestion: function (){
    var questions = [];
    if (this.props.is_first_feedback) {
      questions = _questions.first_feedback_questions;
    } else {
      questions = _questions.other_feedback_questions;
    }

    var index = getRandomInt(0, questions.length);
    var question = questions[index];
    this.setState({question: question});
  },
  saveAnswer: function () {
    var answer = document.getElementById('answer').value;
    if (answer.length >= MIN_ANSWER_LENGTH) {
      var output = {
        question: this.state.question,
        answer: document.getElementById('answer').value
      };
      this.props.callback(output);
    }
    else {
      this.setState({answerError: "Please write a little more."});
    }
  },
  _wait: function () {
    if (this.state.wait > 0) {
      setTimeout(this._wait, this.state.wait * 500);
      this.setState({wait: this.state.wait - 1});
    }
  }
});

if (typeof module !== 'undefined') {
  module.exports = Questions;
}