const { body, validationResult } = require("express-validator");

const Course = require("../models/courseModel");
const Goal = require("../models/goalModel");

exports.courses_list = (req, res, next) => {};

exports.course_create_post = [
  // First / second middleware function --> Validate form input values
  body("name")
    .notEmpty()
    .withMessage("Name field must not be empty")
    .custom((value) => {
      return Course.findOne({ name: value }).then((course) => {
        if (course) throw new Error(`${value} already exists`);
      });
    }),
  body("description")
    .notEmpty()
    .withMessage("Description field must not be empty"),

  // Third middleware function --> Handle errors from validation or save new course
  (req, res, next) => {
    // Check if validation returned errors
    const errors = validationResult(req);

    // If validation result got errors return them
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    // Retrieve reference to course's goals to store them in new course schema with other values
    Goal.find({ name: req.body.goals })
      .select("_id")
      .exec((err, goals) => {
        if (err) {
          return next(err);
        }

        const course = new Course({
          name: req.body.name,
          description: req.body.description,
          goals,
          athenaeum: req.body.athenaeums,
        });

        // Validation passed, store new course in database and send it back
        course.save((err) => {
          if (err) return next(err);
          res.json({ course });
        });
      });
  },
];

exports.course_update_post = (req, res, next) => {};

exports.course_delete_post = (req, res, next) => {};

exports.course_detail = (req, res, next) => {};
