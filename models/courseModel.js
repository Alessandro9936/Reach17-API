const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goals: [{ type: Schema.Types.ObjectId, ref: "Goal", required: true }],
  authenaeums: [
    { type: Schema.Types.ObjectId, ref: "Authenaeum", required: true },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
