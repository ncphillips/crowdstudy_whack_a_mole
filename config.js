'use strict';
var config = {
  /**
   * We want to be able to turn on/off different types of feedback.
   * None and real are all good.
   * How do we
   */
  feedback: {
    types: [, 'real'],
    fake_types: []
  }
};
config.NONE= 'none';
config.REAL = 'real';
config.FAKE = 'fake';

module.exports = config;
