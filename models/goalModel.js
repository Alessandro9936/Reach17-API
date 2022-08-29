const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const goalSchema = new Schema({});

module.exports = mongoose.model("Goal", goalSchema);
