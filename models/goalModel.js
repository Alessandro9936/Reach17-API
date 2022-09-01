const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const goalSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

goalSchema.static(
  "handleRelations",
  async function (action, elementId, course) {
    if (action === "add") {
      await this.findByIdAndUpdate(elementId, {
        $push: { courses: course },
      });
    }
    if (action === "remove") {
      await this.findByIdAndUpdate(elementId, {
        $pull: { courses: course },
      });
    }
  }
);

module.exports = mongoose.model("Goal", goalSchema);
