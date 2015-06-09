module.exports.experiment_name = function (req, res, next){
  req.experiment_name = 'wack_a_mole';
  next();
};