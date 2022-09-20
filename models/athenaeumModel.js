const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const athenaeumSchema = new Schema(
  {
    name: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

// When a course is created and it has an athenaeum in course.athenaeums find athenaeum ID and push course reference into athenaeum.courses
athenaeumSchema.static(
  "addCourseRelation",
  async function (athenaeumID, course) {
    try {
      await this.findByIdAndUpdate(athenaeumID, { $push: { courses: course } });
    } catch (err) {
      throw err;
    }
  }
);

// When a course is deleted and it has an athenaeum in course.athenaeums find athenaeum ID and pull course reference from athenaeum.courses
athenaeumSchema.static(
  "removeCourseRelation",
  async function (athenaeumID, course) {
    try {
      await this.findByIdAndUpdate(athenaeumID, { $pull: { courses: course } });
    } catch (err) {
      throw err;
    }
  }
);

/*
When a course is updated, also athenaeums where it is held can be removed or added. This method goes through all athenaeum.courses and remove or add the course reference.

Case 1: If goal id is specified in old course but NOT in updated course --> remove course reference from athenaeum.courses
Case 2: If athenaeum id is NOT specified in old course but it is in new course --> add course reference to athenaeum.courses
*/
athenaeumSchema.static("updateCourses", async function (oldCourse, newCourse) {
  try {
    // Retrieve all athenaeums in database and select only courses arrays
    const coursesInAthenaeums = await this.find({}, "courses");

    coursesInAthenaeums.forEach(async (course) => {
      // Case 1
      if (
        oldCourse.athenaeums.includes(course._id) &&
        !newCourse.athenaeums.includes(course._id)
      ) {
        await this.findByIdAndUpdate(course._id, {
          $pull: { courses: newCourse._id },
        });
      }

      // Case 2
      if (
        !oldCourse.athenaeums.includes(course._id) &&
        newCourse.athenaeums.includes(course._id)
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

athenaeumSchema.virtual("url").get(function () {
  return "/athenaeums/" + this._id;
});

module.exports = mongoose.model("Athenaeum", athenaeumSchema);
