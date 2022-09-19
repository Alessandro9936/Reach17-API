const goalServices = require("../services/goalServices");

exports.goals_list = async (req, res, next) => {
  try {
    const goals = await goalServices.goals_list(req.query);
    res.status(200).json({ goals });
  } catch (err) {
    return next(err);
  }
};

exports.goal_create_post = async (req, res, next) => {
  try {
    const newGoal = await goalServices.goal_create_post(req);
    res.status(201).json(newGoal);
  } catch (err) {
    return next(err);
  }
};

exports.goal_update_post = async (req, res, next) => {
  try {
    const updatedGoal = await goalServices.goal_update_post(req);
    res.status(201).json(updatedGoal);
  } catch (err) {
    return next(err);
  }
};

exports.goal_delete_post = async (req, res, next) => {
  const deletedGoal = await goalServices.goal_delete_post(req);
  res.status(204).end();
};

exports.goal_detail = async (req, res, next) => {
  try {
    const goal = await goalServices.goal_detail(req);

    res.status(200).json(goal);
  } catch (err) {
    return next(err);
  }
};
