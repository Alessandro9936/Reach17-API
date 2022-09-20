const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const goalSchema = new Schema(
  {
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

// When a course is created and it has a goal in course.goals find goal ID and push course reference into goal.courses
goalSchema.static("addCourseRelation", async function (goalID, course) {
  try {
    await this.findByIdAndUpdate(goalID, { $push: { courses: course } });
  } catch (err) {
    throw err;
  }
});

// When a course is deleted and it has a goal in course.goals find goal ID and pull course reference from goal.courses
goalSchema.static("removeCourseRelation", async function (goalID, course) {
  try {
    await this.findByIdAndUpdate(goalID, { $pull: { courses: course } });
  } catch (err) {
    throw err;
  }
});

/*
When a course is updated, also goals that it belongs to can be removed or added. This method goes through all goal.courses and remove or add the course reference.

Case 1: If goal id is specified in old course but NOT in updated course --> remove course reference from goal.courses
Case 2: If goal id is NOT specified in old course but it is in new course --> add course reference to goal.courses
*/
goalSchema.static("updateCourses", async function (oldCourse, newCourse) {
  try {
    // Retrieve all goals in database and select only courses arrays
    const coursesInGoals = await this.find({}, "courses");

    coursesInGoals.forEach(async (course) => {
      // Case 1
      if (
        oldCourse.goals.includes(course._id) &&
        !newCourse.goals.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $pull: { courses: newCourse._id },
        });
      }

      // Case 2
      if (
        !oldCourse.goals.includes(course._id) &&
        newCourse.goals.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $push: { courses: newCourse._id },
        });
      }
    });
  } catch (err) {
    throw err;
  }
});

goalSchema.virtual("url").get(function () {
  return "/goals/" + this._id;
});

module.exports = mongoose.model("Goal", goalSchema);
