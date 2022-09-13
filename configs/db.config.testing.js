const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const Athenaeum = require("../models/athenaeumModel");
const Course = require("../models/courseModel");
const Goal = require("../models/goalModel");

const { athenaeumsData, coursesData, goalsData } = require("./seedData");

let mongoServer;

// Provide connection to a new in-memory databse server
const connect = async () => {
  try {
    // before establishing a new connection close previously
    await mongoose.disconnect();

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error("Failed to connect to in-memory database:" + err);
  }
};

const close = async () => {
  try {
    await mongoose.disconnect();
    await mongoServer.stop();
  } catch (err) {
    console.error(err);
  }
};

const clear = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      await collections[key].deleteMany();
    }

    await Athenaeum.insertMany(athenaeumsData);
    await Course.insertMany(coursesData);
    await Goal.insertMany(goalsData);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  connect,
  close,
  clear,
};
