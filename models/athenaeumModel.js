const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const athenaeumSchema = new Schema({
  name: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

athenaeumSchema.static(
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

module.exports = mongoose.model("Athenaeum", athenaeumSchema);
