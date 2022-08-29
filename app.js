// Import all dependecies
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const createError = require("http-errors");

// Initiate app with express
const app = express();
app.listen(process.env.PORT || 3000);

// Import DB
const connectDB = require("./configs/db.config");
connectDB();

// Import middlewares

// Import Routes

const goalRoutes = require("./routes/goal");
const courseRoutes = require("./routes/course");
const athenaeumRoutes = require("./routes/athenaeum");

// Initiate App Middlewares

// Log the request
app.use(morgan("dev"));

// Determine which domain can access the website
app.use(cors());

// Parses incoming JSON requests
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Initiate Routes
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/athenaeums", athenaeumRoutes);

// Initiate middlewares

app.use((req, res, next) => {
  next(createError(404));
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
});
