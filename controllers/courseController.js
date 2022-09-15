const { body, validationResult } = require("express-validator");

const courseServices = require("../services/courseServices");
const Course = require("../models/courseModel");

exports.courses_list = async (req, res, next) => {
  // Keep only filter query and remove other type of queries
  const reqQuery = { ...req.query };
  const removeFields = ["sort", "limit"];
  removeFields.forEach((value) => delete reqQuery[value]);

  try {
    const courses = await courseServices.course_list(reqQuery);
    res.status(200).json({ courses });
  } catch (error) {
    return next(error);
  }
};

exports.course_create_post = [
  // First / second middleware function --> Validate form input values
  body("name")
    .notEmpty()
    .withMessage("Course name field must not be empty")
    .isAlphanumeric()
    .withMessage("field must contain only letters or numbers")
    .custom(async (value) => {
      const existingCourse = await Course.findOne({ name: value });
      if (existingCourse) {
        throw new Error(`${value} already exists`);
      }
    })
    .escape(),
  body("description")
    .notEmpty()
    .withMessage("Course description field must not be empty")
    .escape(),

  // Third middleware function --> Handle errors from validation or save new course
  async (req, res, next) => {
    try {
      // Check if validation returned errors
      const errors = validationResult(req);

      // If validation result got errors throw them to be handled
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const newCourse = await courseServices.course_create_post(req);
      res.status(201).json(newCourse);
    } catch (error) {
      return next(error);
    }
  },
];

exports.course_update_post = [
  body("name").notEmpty().withMessage("Name field must not be empty").escape(),
  body("description")
    .notEmpty()
    .withMessage("Description field must not be empty")
    .escape(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const updatedCourse = await courseServices.course_update_post(req);
      res.status(201).json(updatedCourse);
    } catch (err) {
      return next(err);
    }
  },
];

exports.course_delete_post = async (req, res, next) => {
  try {
    await courseServices.course_delete_post(req);
    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

exports.course_detail = async (req, res, next) => {
  try {
    const course = await courseServices.course_detail(req);
    res.status(200).json(course);
  } catch (err) {
    return next(err);
  }
};
