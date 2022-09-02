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
      courseGoals.map((goal) => {
        Goal.handleRelations("add", goal._id, course);
      });
    }

    // If course is held in athenaeums find and update these adding course id to courses array
    if (coursesAthenaeums.length > 0) {
      coursesAthenaeums.map((athenaeum) => {
        Athenaeum.handleRelations("add", athenaeum._id, course);
      });
    }

    // Validation passed, store new course in database and send it back
    course.save((err) => {
      if (err) return next(err);
      res.json({ course });
    });
  },
];

exports.course_update_post = [
  body("name").notEmpty().withMessage("Name field must not be empty"),
  body("description")
    .notEmpty()
    .withMessage("Description field must not be empty"),

  // Third middleware function --> Handle errors from validation or update course and relations
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Get course before any update
      const oldCourse = await Course.findById(req.params.id);

      // Store for clarity updated input fields
      const updatedName = req.body.name;
      const updateDescription = req.body.description;
      const updatedGoals = await Goal.find({ name: req.body.goals }).select(
        "_id"
      );
      const updatedAthenaeums = await Athenaeum.find({
        name: req.body.athenaeums,
      }).select("_id");

      // Update course in database with new values
      Course.findByIdAndUpdate(
        req.params.id,
        {
          name: updatedName,
          description: updateDescription,
          goals: updatedGoals,
          athenaeums: updatedAthenaeums,
        },
        { new: true }, // return update goal instead of original
        (err, newCourse) => {
          if (err) return next(err);

          /* When updating a course as well as name and description the user can also remove or add
          athenaeums where the course is held or goals which the course belongs in.

          With the updateCourses static method on each model we can add or remove the course reference depending if there is a relation or not*/
          Goal.updateCourses(oldCourse, newCourse);
          Athenaeum.updateCourses(oldCourse, newCourse);

          res.json({ newCourse });
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
];

exports.course_delete_post = (req, res, next) => {
  Course.findByIdAndDelete(req.params.id, (err, course) => {
    if (err) return next(err);

    //Remove all reference to course in goal.courses & athenaeum.courses
    course.athenaeums.map((athenaeum) => {
      Athenaeum.handleRelations("remove", athenaeum._id, course._id);
    });
    course.goals.map((goal) => {
      Goal.handleRelations("remove", goal._id, course._id);
    });
  });

  res.redirect("/");
};

exports.course_detail = (req, res, next) => {};
