module.exports.experiment = function (req, res) {
  res.render('index', {});
};

module.exports.experiment_name = function (req, res, next){
  req.experiment_name = 'wack_a_mole';
  next();
};

module.exports.get_completed_work = function (req, res, next) {

};

module.exports.real_stats = function (req, res, next) {
  var workers = req.db.collections('workers');
  workers.find({experiments: {wack_a_mole: {completed: true}}}).exec(function (err, workers){
    if (err) return next(err);
    if (workers.length > 0) {
      console.log("Workers:", workers);
      var character_count
    }
  });
};

function mean(num_array){
  var total = 0;
  num_array.forEach(function (value) {
    total += value;
  });
  return total / num_array.length;
}