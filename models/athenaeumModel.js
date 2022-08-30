const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const athenaeumSchema = new Schema({
  name: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

module.exports = mongoose.model("Athenaeum", athenaeumSchema);
