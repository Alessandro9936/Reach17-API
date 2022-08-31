const { body, validationResult } = require("express-validator");

const Athenaeum = require("../models/athenaeumModel");
const Course = require("../models/courseModel");
const Goal = require("../models/goalModel");

exports.courses_list = async (req, res, next) => {
  const courses = await Course.find();
  res.json({ courses });
};

exports.course_create_post = [
  // First / second middleware function --> Validate form input values
  body("name")
    .notEmpty()
    .withMessage("Name field must not be empty")
    .custom(async (value) => {
      const existingCourse = await Course.findOne({ name: value });
      if (existingCourse) {
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

    // Retrieve reference to course's goals
    const courseGoals = await Goal.find({ name: req.body.goals }).select("_id");

    // Retrieve reference to athenaeums where course is held
    const coursesAthenaeums = await Athenaeum.find({
      name: req.body.athenaeums,
    }).select("_id");

    const course = new Course({
      name: req.body.name,
      description: req.body.description,
      goals: courseGoals,
      athenaeums: coursesAthenaeums,
    });

    // If course has goals find and update these adding course id to courses array
    if (courseGoals.length > 0) {
      courseGoals.map(async (goal) => {
        await Goal.findByIdAndUpdate(goal._id, {
          $push: { courses: course },
        });
      });
    }

    // If course is held in athenaeums find and update these adding course id to courses array
    if (coursesAthenaeums.length > 0) {
      coursesAthenaeums.map(async (athenaeum) => {
        await Athenaeum.findByIdAndUpdate(athenaeum._id, {
          $push: { courses: course },
        });
      });
    }

    // Validation passed, store new course in database and send it back
    course.save((err) => {
      if (err) return next(err);
      res.json({ course });
    });
  },
];

exports.course_update_post = async (req, res, next) => {
  // Store for clarity modified input fields
  const updatedName = req.body.name;
  const updateDescription = req.body.description;
  const updatedCourses = await Course.find({ name: req.body.courses }).select(
    "_id"
  );
  const updatedAthenaeums = await Athenaeum.find({
    name: req.body.athenaeums,
  }).select("_id");

  Course.findByIdAndUpdate(
    req.params.id,
    {
      name: updatedName,
      description: updateDescription,
      courses: updatedCourses,
      athenaeums: updatedAthenaeums,
    },
    { new: true }, // return update goal instead of original
    (err, course) => {
      if (err) return next(err);
      res.json({ course });
    }
  );
};

exports.course_delete_post = (req, res, next) => {};

exports.course_detail = (req, res, next) => {};
