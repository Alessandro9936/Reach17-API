const { body, validationResult } = require("express-validator");

const Goal = require("../models/goalModel");
const Course = require("../models/courseModel");

exports.goals_list = async (req, res, next) => {
  const goals = await Goal.find();
  res.json({ goals });
};

exports.goal_create_post = [
  // First / second middleware function --> Validate form input values
  body("name")
    .notEmpty()
    .withMessage("Name field must not be empty")
    .custom(async (value) => {
      const existingGoald = await Goal.findOne({ name: value });
      if (existingGoald) {
        throw new Error(`${value} already exists`);
      }
    }),
  body("description")
    .notEmpty()
    .withMessage("Description field must not be empty"),

  // Third middleware function --> Handle errors from validation or save new course
  async (req, res, next) => {
    // Check if validation returned errors
    const errors = validationResult(req);

    // If validation result got errors return them
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Retrieve reference to courses related to goal to store them in new goal schema with other values
    const coursesInGoal = await Course.find({ name: req.body.courses }).select(
      "_id"
    );

    const goal = new Goal({
      name: req.body.name,
      description: req.body.description,
      courses: coursesInGoal,
    });

    // If courses are selected while creating new goal find and update these adding course id to goals array
    if (coursesInGoal.length > 0) {
      coursesInGoal.map((course) => {
        Course.handleRelations("add", "goal", course._id, goal);
      });
    }

    // Validation passed, store new course in database and send it back
    goal.save((err) => {
      if (err) return next(err);
      res.json({ goal });
    });
  },
];

exports.goal_update_post = async (req, res, next) => {
  // Store for clarity modified input fields
  const updatedName = req.body.name;
  const updateDescription = req.body.description;
  const updatedCourses = await Course.find({ name: req.body.courses }).select(
    "_id"
  );

  Goal.findByIdAndUpdate(
    req.params.id,
    {
      name: updatedName,
      description: updateDescription,
      courses: updatedCourses,
    },
    { new: true }, // return update goal instead of original
    (err, goal) => {
      if (err) return next(err);
      res.json({ goal });
    }
  );
};

exports.goal_delete_post = (req, res, next) => {};

exports.goal_detail = (req, res, next) => {};
