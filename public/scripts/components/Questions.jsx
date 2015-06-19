var WorkerStore = require('WorkerStore');
var ExperimentStore = require('ExperimentStore');

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

var Questions = React.createClass({
  render: function () {
    var buttonDisabled = this.state.wait > 0;
    var buttonText = buttonDisabled ? "Continue in " + this.state.wait + " seconds." : "Continue";
    return (
      <div>
        <p>{this.state.question}</p>
        <textarea id="answer" ref="answer" className="form-control"/>
        <input type="button" className="btn btn-block btn-default" value={buttonText} disabled={buttonDisabled} onClick={this.saveAnswer}/>
      </div>
    );
  },
  getDefaultProps: function () {
    return props;
  },
  getInitialState: function () {
    return {
      wait: 3,
      question: '',
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
  setQuestion: function (){
    var question = '';
    if (this.props.is_first_feedback) {
      question = _questions.first_feedback_questions[0];
    } else {
      question = _questions.other_feedback_questions[0];
    }
    this.setState({question: question});
  },
  saveAnswer: function () {
    var answer = document.getElementById('answer').value;
    var output = {
      question: this.state.question,
      answer: answer
    };
    this.props.callback(output);
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

module.exports = Questions;