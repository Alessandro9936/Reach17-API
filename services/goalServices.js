const Goal = require("../models/goalModel");
const Course = require("../models/courseModel");

const createError = require("http-errors");

const goals_list = async (query) => {
  try {
    // Check if the query is empty, if it is get all athenaeums
    if (Object.keys(query).length === 0) {
      const allGoals = await Goal.find().populate({
        path: "courses",
        select: "name",
      });
      return allGoals;
    }

    // if query sort is defined, sort all goals by name in ascending or descending order
    const sortedGoals = await Goal.find({})
      .sort(query.sort)
      .populate({ path: "courses", select: "name" });
    return sortedGoals;
  } catch (error) {
    throw createError(500, error);
  }
};

const goal_create_post = async (req) => {
  try {
    // Retrieve reference to courses that belong in goal
    const coursesInGoal = await Course.find(
      {
        name: req.body.courses,
      },
      "_id"
    );

    const goal = new Goal({
      name: req.body.name,
      description: req.body.description,
      courses: coursesInGoal,
    });

    // If goal has courses find and update these adding goal to course.goals
    if (coursesInGoal.length > 0) {
      coursesInGoal.map((course) => {
        Course.addRelations("goal", course._id, goal);
      });
    }

    await goal.save();
    return goal;
  } catch (error) {
    throw createError(500, error);
  }
};

const goal_update_post = async (req) => {
  try {
    // Get goal before any update
    const oldGoal = await Goal.findById(req.params.id);

    // Store for clarity modified input fields
    const updatedName = req.body.name;
    const updateDescription = req.body.description;
    const updatedCourses = await Course.find(
      {
        name: req.body.courses,
      },
      "_id"
    );

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        name: updatedName,
        description: updateDescription,
        courses: updatedCourses,
      },
      { new: true }
    );

    /* When updating a goal user can also add or remove courses that belong in it.

    With the updateGoals static method on course model we can add or remove from goal.courses the reference depending if there is a relation or not*/
    Course.updateGoals(oldGoal, updatedGoal);
    return updatedGoal;
  } catch (error) {
    throw createError(500, error);
  }
};

const goal_delete_post = async (req) => {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);

    //Remove all reference to course in goal.courses & athenaeum.courses
    deletedGoal.courses.map((course) => {
      Course.removeRelations("goal", course._id, deletedGoal._id);
    });

    return deletedGoal;
  } catch (error) {
    throw { status: 500, error };
  }
};

const goal_detail = async (req) => {
  try {
    const goal = await Goal.findById(req.params.id);
    return goal;
  } catch (error) {
    throw createError(500, error);
  }
};

module.exports = {
  goals_list,
  goal_create_post,
  goal_update_post,
  goal_delete_post,
  goal_detail,
};
