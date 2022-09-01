const { body, validationResult } = require("express-validator");

const Athenaeum = require("../models/athenaeumModel");
const Course = require("../models/courseModel");

exports.athenaeums_list = async (req, res, next) => {
  const athenaeums = await Athenaeum.find();
  res.json({ athenaeums });
};

exports.athenaeum_create_post = [
  // First / second middleware function --> Validate form input values
  body("name")
    .notEmpty()
    .withMessage("Athenaeum field must not be empty")
    .custom(async (value) => {
      const existingAthenaeum = await Athenaeum.findOne({ name: value });
      if (existingAthenaeum) {
        throw new Error(`${value} already exists`);
      }
    }),

  // Third middleware function --> Handle errors from validation or save new course
  async (req, res, next) => {
    // Check if validation returned errors
    const errors = validationResult(req);

    // If validation result got errors return them
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Retrieve reference to course's goals to store them in new course schema with other values
    const coursesInAthenaeum = await Course.find({
      name: req.body.courses,
    }).select("_id");

    const athenaeum = new Athenaeum({
      name: req.body.name,
      courses: coursesInAthenaeum,
    });

    // If athenaeum hold courses find and update these adding atheneaum id to atheneaums array
    if (coursesInAthenaeum.length > 0) {
      coursesInAthenaeum.map((course) => {
        Course.handleRelations("add", "athenaeum", course._id, athenaeum);
      });
    }

    // Validation passed, store new course in database and send it back
    athenaeum.save((err) => {
      if (err) return next(err);
      res.json({ athenaeum });
    });
  },
];

exports.athenaeum_update_post = async (req, res, next) => {
  // Store for clarity modified input fields
  const updatedName = req.body.name;
  const updatedCourses = await Course.find({ name: req.body.courses }).select(
    "_id"
  );

  Athenaeum.findByIdAndUpdate(
    req.params.id,
    {
      name: updatedName,
      courses: updatedCourses,
    },
    { new: true }, // return update goal instead of original
    (err, athenaeum) => {
      if (err) return next(err);
      res.json({ athenaeum });
    }
  );
};

exports.athenaeum_delete_post = (req, res, next) => {};

exports.athenaeum_detail = (req, res, next) => {};
