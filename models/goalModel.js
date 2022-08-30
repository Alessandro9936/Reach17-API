const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const goalSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  courses: { type: Schema.Types.ObjectId, ref: "Course" },
});

module.exports = mongoose.model("Goal", goalSchema);
