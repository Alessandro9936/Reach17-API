const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goals: [{ type: Schema.Types.ObjectId, ref: "Goal", required: true }],
  athenaeum: [
    { type: Schema.Types.ObjectId, ref: "Athenaeum", required: true },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
