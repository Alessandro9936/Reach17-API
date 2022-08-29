require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  const databaseLink = process.env.DB_STRING;

  // Setup default mongoose connection
  mongoose.connect(databaseLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Get default connection
  const db = mongoose.connection;

  //bind connection to error event (to get notification of connection errors)
  db.on("error", console.error.bind(console));

  return db;
}

module.exports = connectDB;
