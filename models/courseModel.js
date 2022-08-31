const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goals: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
  athenaeums: [{ type: Schema.Types.ObjectId, ref: "Athenaeum" }],
});

module.exports = mongoose.model("Course", courseSchema);
