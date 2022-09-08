const Course = require("../models/courseModel");
const Athenaeum = require("../models/athenaeumModel");
const Goal = require("../models/goalModel");

const course_list = async (query) => {
  try {
    // Check if the query is empty, if it is get all courses
    if (Object.keys(query).length === 0) {
      const allCourses = await Course.find();
      return allCourses;
    }

    // If query filter by name, find course with name
    if (query.name) {
      const course = await Course.find({ name: query.name });
      return course;
    }

    // If query filter by goal name, first find goal id and then search courses that have goal id in courses.goals
    if (query.goals) {
      const goalID = await Goal.findOne({ name: query.goals }, "_id");
      const coursesWithGoal = await Course.find({ goals: goalID });
      return coursesWithGoal;
    }

    // If query filter by athenaeum name, first find athenaeum id and then search courses that have athenaeum id in courses.athenaeums
    if (query.athenaeums) {
      const athenaeumID = await Athenaeum.findOne(
        {
          name: query.athenaeums,
        },
        "_id"
      );
      const coursesWithAthenaeum = await Course.find({
        athenaeums: athenaeumID,
      });
      return coursesWithAthenaeum;
    }
  } catch (error) {
    throw createError(500, error);
  }
};

const course_create_post = async (req) => {
  try {
    // Retrieve reference to course's goals
    const courseGoals = await Goal.find({ name: req.body.goals }, "_id");

    // Retrieve reference to athenaeums where course is held
    const coursesAthenaeums = await Athenaeum.find(
      {
        name: req.body.athenaeums,
      },
      "_id"
    );

    const course = new Course({
      name: req.body.name,
      description: req.body.description,
      goals: courseGoals,
      athenaeums: coursesAthenaeums,
    });

    // If course has goals find and update these adding course id to goal.courses
    if (courseGoals.length > 0) {
      courseGoals.forEach((goal) => {
        Goal.addCourseRelation(goal._id, course);
      });
    }

    // If course is held in athenaeums find and update these adding course id to athenaeum.courses
    if (coursesAthenaeums.length > 0) {
      coursesAthenaeums.forEach((athenaeum) => {
        Athenaeum.addCourseRelation(athenaeum._id, course);
      });
    }

    // Save new course in
    await course.save();
    return course;
  } catch (error) {
    throw createError(500, error);
  }
};

const course_update_post = async (req) => {
  try {
    // Get course before any update
    const oldCourse = await Course.findById(req.params.id);

    // Store for clarity updated input fields
    const updatedName = req.body.name;
    const updateDescription = req.body.description;
    const updatedGoals = await Goal.find({ name: req.body.goals }, "_id");
    const updatedAthenaeums = await Athenaeum.find(
      {
        name: req.body.athenaeums,
      },
      "_id"
    );

    // Update course in database with new values
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name: updatedName,
        description: updateDescription,
        goals: updatedGoals,
        athenaeums: updatedAthenaeums,
      },
      { new: true }
    );

    /* When updating a course as well as name and description the user can also remove or add athenaeums where the course is held or goals which the course belongs in.

  With the updateCourses static method on each model we can add or remove the course reference depending if there is a relation or not*/

    Goal.updateCourses(oldCourse, updatedCourse);
    Athenaeum.updateCourses(oldCourse, updatedCourse);

    return updatedCourse;
  } catch (error) {
    throw createError(500, error);
  }
};

const course_delete_post = async (req) => {
  try {
    const deleteCourse = await Course.findByIdAndDelete(req.params.id);

    //Remove all reference to course in goal.courses & athenaeum.courses
    deleteCourse.athenaeums.map((athenaeum) => {
      Athenaeum.removeCourseRelation(athenaeum._id, deleteCourse._id);
    });
    deleteCourse.goals.map((goal) => {
      Goal.removeCourseRelation(goal._id, deleteCourse._id);
    });

    return deleteCourse;
  } catch (error) {
    throw createError(500, error);
  }
};

const course_detail = async (req) => {
  try {
    const course = await Course.findById(req.params.id);
    return course;
  } catch (error) {
    throw createError(500, error);
  }
};

module.exports = {
  course_list,
  course_create_post,
  course_update_post,
  course_delete_post,
  course_detail,
};
