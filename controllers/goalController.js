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

    // Retrieve id of courses that user wants to belong in goal in order to store them in the new goal's schema
    const coursesInGoal = await Course.find({ name: req.body.courses }).select(
      "_id"
    );

    const goal = new Goal({
      name: req.body.name,
      description: req.body.description,
      courses: coursesInGoal,
    });

    // If courses are selected while creating new goal find and update these adding course reference to course.goals array
    if (coursesInGoal.length > 0) {
      coursesInGoal.map((course) => {
        Course.addRelations("goal", course._id, goal);
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
      { new: true }, // return updated goal instead of original
      (err, newGoal) => {
        if (err) return next(err);

        /* When updating a goal user can also add or remove courses that belong in it.

          With the updateGoals static method on course model we can add or remove from it the goal reference depending if there is a relation or not*/
        Course.updateGoals(oldGoal, newGoal);

        res.redirect(newGoal.url);
      }
    );
  },
];

exports.goal_delete_post = (req, res, next) => {
  Goal.findByIdAndDelete(req.params.id, (err, goal) => {
    if (err) return next(err);

    //Remove all reference to course in goal.courses & athenaeum.courses
    goal.courses.map((course) => {
      Course.removeRelations("goal", course._id, goal._id);
    });
  });
};

exports.goal_detail = async (req, res, next) => {
  const goal = await Goal.findById(req.params.id);

  res.json({ goal });
};
