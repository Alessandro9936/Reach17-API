const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goals: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
  athenaeums: [{ type: Schema.Types.ObjectId, ref: "Athenaeum" }],
});

courseSchema.static(
  "handleRelations",
  async function (action, elementType, courseId, element) {
    if (action === "add" && elementType === "goal") {
      await this.findByIdAndUpdate(courseId, {
        $push: { goals: element },
      });
    } else if (action === "add" && elementType === "athenaeum") {
      await this.findByIdAndUpdate(courseId, {
        $push: { athenaeums: element },
      });
    }

    if (action === "remove" && elementType === "goal") {
      await this.findByIdAndUpdate(courseId, {
        $pull: { goals: element },
      });
    } else if (action === "remove" && elementType === "athenaeum") {
      await this.findByIdAndUpdate(courseId, {
        $pull: { athenaeums: element },
      });
    }
  }
);

module.exports = mongoose.model("Course", courseSchema);

// remove , add
