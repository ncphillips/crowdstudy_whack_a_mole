var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');

describe('get_completed_work', function () {
  var req;
  var worker_1;
  var worker_2;
  beforeEach(function (done) {
    req = {};

    var url = 'mongodb://localhost:27017/crowdstudy_test';
    MongoClient.connect(url, function (err, db) {
      if (err) {
        log.error(err);
        return done(err);
      }

      req.db = db;
      create_workers(req, done);
    });
  });

  function create_workers(req, done) {
    var worker_1 = {

    };
    req.db.collection('workers').insert([])
  }

  it('should ')
});
