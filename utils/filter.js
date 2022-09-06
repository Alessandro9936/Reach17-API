const Athenaeum = require("../models/athenaeumModel");
const Course = require("../models/courseModel");
const Goal = require("../models/goalModel");

async function filter(query) {
  // If query filter by name, find course with name
  if (query.name) {
    const nameToFind = query.name;
    const course = await Course.find({ name: nameToFind });
    return course;
  }

  // If query filter by goal name, first find goal id and then search courses that have goal id in courses.goals
  if (query.goals) {
    const goalNameToFind = query.goals;
    const goalID = await Goal.findOne({ name: goalNameToFind }).select("_id");
    const coursesWithGoal = await Course.find({ goals: goalID });
    return coursesWithGoal;
  }

  // If query filter by athenaeum name, first find athenaeum id and then search courses that have athenaeum id in courses.athenaeums
  if (query.athenaeums) {
    const athenaeumNameToFind = query.athenaeums;
    const athenaeumID = await Athenaeum.findOne({
      name: athenaeumNameToFind,
    }).select("_id");
    const coursesWithAthenaeum = await Course.find({
      athenaeums: athenaeumID,
    });
    return coursesWithAthenaeum;
  }
}

module.exports = filter;
