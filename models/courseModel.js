const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    name: { type: String, required: true },
    goals: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
    athenaeums: [{ type: Schema.Types.ObjectId, ref: "Athenaeum" }],
  },
  { timestamps: true }
);

// When a goal or athenaeum are created if they have a course reference inside courses array, find course and add the relation to goal and athenaeum
courseSchema.static(
  "addRelations",
  async function (elementType, courseID, element) {
    try {
      if (elementType === "goal") {
        await this.findByIdAndUpdate(courseID, {
          $push: { goals: element },
        });
      } else if (elementType === "athenaeum") {
        await this.findByIdAndUpdate(courseID, {
          $push: { athenaeums: element },
        });
      }
    } catch (err) {
      throw err;
    }
  }
);

// When a goal or athenaeum are deleted if they have a course reference inside courses array, find course and remove the relation to goal and athenaeum
courseSchema.static(
  "removeRelations",
  async function (elementType, courseID, element) {
    try {
      if (elementType === "goal") {
        await this.findByIdAndUpdate(courseID, {
          $pull: { goals: element },
        });
      } else if (elementType === "athenaeum") {
        await this.findByIdAndUpdate(courseID, {
          $pull: { athenaeums: element },
        });
      }
    } catch (err) {
      throw err;
    }
  }
);

/*
When a goal is updated, also courses that belong into it can be removed or added. This method goes through all course.goals and remove or add the goal reference.

Case 1: If course id is specified in old goal but NOT in updated goal --> remove goal reference from course.goals
Case 2: If course id is NOT specified in old goal but it is in new goal --> add goal reference to course.goals
*/
courseSchema.static("updateGoals", async function (oldGoal, newGoal) {
  try {
    const courses = await this.find({});

    courses.forEach(async (course) => {
      if (
        oldGoal.courses.includes(course._id) &&
        !newGoal.courses.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $pull: { goals: newGoal._id },
        });
      }

      if (
        !oldGoal.courses.includes(course._id) &&
        newGoal.courses.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $push: { goals: newGoal._id },
        });
      }
    });
  } catch (err) {
    throw err;
  }
});

/*
When an athenaeum is updated, also courses that are held into it can be removed or added. This method goes through all course.athenaeums and remove or add the athenaeum reference.

Case 1: If course id is specified in old athenaeum but NOT in updated athenaeum --> remove athenaeum reference from course.athenaeums
Case 2: If course id is NOT specified in old athenaeum but it is in new athenaeum --> add athenaeum reference to course.athenaeums
*/
courseSchema.static(
  "updateAtheaneums",
  async function (oldAthenaeum, newAthenaeum) {
    try {
      const courses = await this.find({});

      courses.forEach(async (course) => {
        if (
          oldAthenaeum.courses.includes(course._id) &&
          !newAthenaeum.courses.includes(course._id)
        ) {
          await this.findByIdAndUpdate(course._id, {
            $pull: { athenaeums: newAthenaeum._id },
          });
        }

        if (
          !oldAthenaeum.courses.includes(course._id) &&
          newAthenaeum.courses.includes(course._id)
        ) {
          await this.findByIdAndUpdate(course._id, {
            $push: { athenaeums: newAthenaeum._id },
          });
        }
      });
    } catch (err) {
      throw err;
    }
  }
);

courseSchema.virtual("url").get(function () {
  return "/courses/" + this._id;
});

module.exports = mongoose.model("Course", courseSchema);
