const { body, validationResult } = require("express-validator");
const Goal = require("../models/goalModel");

const goalServices = require("../services/goalServices");

exports.goals_list = async (req, res, next) => {
  try {
    const goals = await goalServices.goals_list(req.query);
    res.status(200).json({ goals });
  } catch (err) {
    return next(err);
  }
};

exports.goal_create_post = [
  body("name")
    .notEmpty()
    .withMessage("Goal name field must not be empty")
    .isAlphanumeric()
    .withMessage("field must contain only letters or numbers")
    .custom(async (value) => {
      const existingGoald = await Goal.findOne({ name: value });
      if (existingGoald) {
        throw new Error(`${value} already exists`);
      }
    })
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Goal description field must not be empty")
    .escape(),

  async (req, res, next) => {
    try {
      // Check if validation returned errors
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const newGoal = await goalServices.goal_create_post(req);
      res.status(201).json(newGoal);
    } catch (err) {
      return next(err);
    }
  },
];

exports.goal_update_post = [
  body("name")
    .notEmpty()
    .withMessage("Name field must not be empty")
    .isAlphanumeric()
    .withMessage("field must contain only letters or numbers")
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Description field must not be empty")
    .escape(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const updatedGoal = await goalServices.goal_update_post(req);
      res.status(201).json(updatedGoal);
    } catch (err) {
      return next(err);
    }
  },
];

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
