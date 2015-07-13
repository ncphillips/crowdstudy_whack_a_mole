'use strict';

if (typeof require !== 'undefined') {
//var React = require('react');
  var WorkerStore = require('WorkerStore');
  var ExperimentStore = require('ExperimentStore');
}

var MIN_ANSWER_LENGTH = 1;

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

var getTwoRandomInt = function (min, max) {
  var first = getRandomInt(min, max);
  var second = first;
  while(second === first) {
    second = getRandomInt(min, max);
  }
  return [first, second];
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

    var questions = this.state.questions.map(function (text, i) {
      var refName = "answer" + (i+1);
      return (
        <div><p>{text}</p>
          <div className={areaClass}>
            <textarea id={refName} ref={refName} className="form-control"/>
          </div>
        </div>
      );
    });

    return (
        <div>
          <p>Please look at your feedback table above carefully, and answer the questions below to complete this round.</p>
          {questions}
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
      questions: [],
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

    var qis= getTwoRandomInt(0, questions.length - 1);
    var qs = [questions[qis[0]], questions[qis[1]]];
    this.setState({questions: qs});
  },
  saveAnswer: function () {
    var answer1 = document.getElementById('answer1').value;
    var answer2 = document.getElementById('answer2').value;
    if (answer1.length >= MIN_ANSWER_LENGTH && answer2.length >= MIN_ANSWER_LENGTH) {
      var output = [
        {
          question: this.state.questions[0],
          answer: answer1
        },
        {
          question: this.state.questions[1],
          answer: answer2
        }
      ];
      this.props.callback(output);
    }
    else {
      this.setState({answerError: "Please input an answer."});
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