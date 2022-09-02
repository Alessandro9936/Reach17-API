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

exports.goal_update_post = [
  body("name").notEmpty().withMessage("Name field must not be empty"),
  body("description")
    .notEmpty()
    .withMessage("Description field must not be empty"),

  // Third middleware function --> Handle errors from validation or update goal and relations
  async (req, res, next) => {
    const errors = validationResult(req);

    // If validation result got errors return them
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Get goal before any update
    const oldGoal = await Goal.findById(req.params.id);

    // Store for clarity modified input fields
    const updatedName = req.body.name;
    const updateDescription = req.body.description;
    const updatedCourses = await Course.find({ name: req.body.courses }).select(
      "_id"
    );

    // Update goal in database with new values
    Goal.findByIdAndUpdate(
      req.params.id,
      {
        name: updatedName,
        description: updateDescription,
        courses: updatedCourses,
      },
      { new: true }, // return update goal instead of original
      (err, newGoal) => {
        if (err) return next(err);

        /* When updating a goal user can also add or remove courses that belong in it.

          With the updateGoals static method on course model we can add or remove from it the goal reference
          depending if there is a relation or not*/
        Course.updateGoals(oldGoal, newGoal);

        res.json({ newGoal });
      }
    );
  },
];

exports.goal_delete_post = (req, res, next) => {};

exports.goal_detail = (req, res, next) => {};
