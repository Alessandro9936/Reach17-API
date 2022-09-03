const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goals: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
  athenaeums: [{ type: Schema.Types.ObjectId, ref: "Athenaeum" }],
});

// Similar to addCourseRelation on other models, this one also accept another parameter (elementType) which specifiecs whether the element to push is an athenaeum or a goal. This also allow to define in which array the element must be pushed
courseSchema.static(
  "addRelations",
  async function (elementType, courseID, element) {
    if (elementType === "goal") {
      await this.findByIdAndUpdate(courseID, {
        $push: { goals: element },
      });
    } else if (elementType === "athenaeum") {
      await this.findByIdAndUpdate(courseID, {
        $push: { athenaeums: element },
      });
    }
  }
);

courseSchema.static(
  "removeRelations",
  async function (elementType, courseID, element) {
    if (elementType === "goal") {
      await this.findByIdAndUpdate(courseID, {
        $pull: { goals: element },
      });
    } else if (elementType === "athenaeum") {
      await this.findByIdAndUpdate(courseID, {
        $pull: { athenaeums: element },
      });
    }
  }
);

/**
 * Loop through existing courses to add or remove goal depending if there is a relation or not after changes in goal.courses
 * @param {object} oldGoal goal before any update
 * @param {object} newGoal goal after updates
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
    console.log(err);
  }
});

/**
 * Loop through existing courses to add or remove goal depending if there is a relation or not after changes in athenaeum.courses
 * @param {object} oldGoal goal before any update
 * @param {object} newGoal goal after updates
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
      console.log(err);
    }
  }
);

module.exports = mongoose.model("Course", courseSchema);
