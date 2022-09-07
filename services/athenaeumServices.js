const Athenaeum = require("../models/athenaeumModel");
const Course = require("../models/courseModel");

const athenaeums_list = async (query) => {
  try {
    // Check if the query is empty, if it is get all athenaeums
    if (Object.keys(query).length === 0) {
      const athenaeums = await Athenaeum.find();
      return athenaeums;
    }

    const sortedAthenaeums = await Athenaeum.find({}).sort(query.sort);
    return sortedAthenaeums;
  } catch (error) {
    return { status: 500, error };
  }
};

const athenaeum_create_post = async (req) => {
  try {
    // Retrieve reference to courses that are held in athenaeum
    const coursesInAthenaeum = await Course.find(
      {
        name: req.body.courses,
      },
      "_id"
    );

    const athenaeum = new Athenaeum({
      name: req.body.name,
      courses: coursesInAthenaeum,
    });

    // If athenaeum has courses find and update these adding athenaeum id to course.athenaeums
    if (coursesInAthenaeum.length > 0) {
      coursesInAthenaeum.map((course) => {
        Course.addRelations("athenaeum", course._id, athenaeum);
      });
    }

    await athenaeum.save();
    return athenaeum;
  } catch (error) {
    throw { status: 500, error };
  }
};

const athenaeum_update_post = async (req) => {
  try {
    // Get athenaeum before any update
    const oldAthenaeum = await Athenaeum.findById(req.params.id);

    // Store for clarity modified input fields
    const updatedName = req.body.name;
    const updatedCourses = await Course.find(
      {
        name: req.body.courses,
      },
      "_id"
    );

    const updatedAthenaeum = await Athenaeum.findByIdAndUpdate(
      req.params.id,
      {
        name: updatedName,
        courses: updatedCourses,
      },
      { new: true }
    );

    /* When updating an athenaeum user can also add or remove courses that are held in it.

    With the updateAtheaneums static method on course model we can add or remove from course.athenaeums the atheneaum reference depending if there is a relation or not*/

    Course.updateAtheaneums(oldAthenaeum, updatedAthenaeum);
    return updatedAthenaeum;
  } catch (error) {
    throw { status: 500, error };
  }
};

const athenaeum_delete_post = async (req) => {
  try {
    const deletedAthenaeum = await Athenaeum.findByIdAndDelete(req.params.id);

    deletedAthenaeum.courses.map((course) => {
      Course.removeRelations("athenaeum", course._id, deletedAthenaeum._id);
    });

    return deletedAthenaeum;
  } catch (error) {
    throw { status: 500, error };
  }
};

const athenaeum_detail = async (req) => {
  try {
    const athenaeum = await Athenaeum.findById(req.params.id);
    return athenaeum;
  } catch (error) {
    throw { status: 500, error };
  }
};

module.exports = {
  athenaeums_list,
  athenaeum_create_post,
  athenaeum_update_post,
  athenaeum_delete_post,
  athenaeum_detail,
};
