const { body, validationResult } = require("express-validator");
const Athenaeum = require("../models/athenaeumModel");
const Course = require("../models/courseModel");

exports.athenaeums_list = async (req, res, next) => {
  try {
    const athenaeums = await Athenaeum.find();
    res.json({ athenaeums });
  } catch (err) {
    return next(err);
  }
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
    try {
      // Check if validation returned errors
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Retrieve id of courses that are hold in athenaeum in order to store them in the new athenaeum's schema
      const coursesInAthenaeum = await Course.find({
        name: req.body.courses,
      }).select("_id");

      const athenaeum = new Athenaeum({
        name: req.body.name,
        courses: coursesInAthenaeum,
      });

      // If athenaeum hold courses find and update these adding atheneaum reference to course.athenaeums array
      if (coursesInAthenaeum.length > 0) {
        coursesInAthenaeum.map((course) => {
          Course.addRelations("athenaeum", course._id, athenaeum);
        });
      }

      // Validation passed, store new course in database and send it back
      athenaeum.save((err) => {
        if (err) return next(err);
        res.json({ athenaeum });
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.athenaeum_update_post = [
  body("name").notEmpty().withMessage("Name field must not be empty"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Get athenaeum before any update
      const oldAthenaeum = await Athenaeum.findById(req.params.id);

      // Store for clarity modified input fields
      const updatedName = req.body.name;
      const updatedCourses = await Course.find({
        name: req.body.courses,
      }).select("_id");

      // Update athenaeum in database with new values
      Athenaeum.findByIdAndUpdate(
        req.params.id,
        {
          name: updatedName,
          courses: updatedCourses,
        },
        { new: true }, // return updated goal instead of original
        (err, newAthenaeum) => {
          if (err) return next(err);

          /* When updating an athenaeum user can also add or remove courses that are held in it.

          With the updateAtheaneums static method on course model we can add or remove from it the atheneaum reference depending if there is a relation or not*/
          Course.updateAtheaneums(oldAthenaeum, newAthenaeum);

          res.redirect(newAthenaeum.url);
        }
      );
    } catch (err) {
      return next(err);
    }
  },
];

exports.athenaeum_delete_post = (req, res, next) => {
  Athenaeum.findByIdAndDelete(req.params.id, (err, athenaeum) => {
    if (err) return next(err);

    //Remove all reference to course in goal.courses & athenaeum.courses
    athenaeum.courses.map((course) => {
      Course.removeRelations("athenaeum", course._id, athenaeum._id);
    });
  });
};

exports.athenaeum_detail = async (req, res, next) => {
  try {
    const athenaeum = await Athenaeum.findById(req.params.id);

    res.json({ athenaeum });
  } catch (err) {
    return next(err);
  }
};
