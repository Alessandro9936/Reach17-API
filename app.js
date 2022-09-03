// Import all dependecies
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const createError = require("http-errors");
const multer = require("multer")();

// Initiate app with express
const app = express();
app.listen(process.env.PORT || 3000);

// Import and connect DB
const connectDB = require("./configs/db.config");
connectDB();

// Import middlewares

// Import Routes

const goalRoutes = require("./routes/goal");
const courseRoutes = require("./routes/course");
const athenaeumRoutes = require("./routes/athenaeum");

// Initiate App Middlewares

// Parses incoming requests
app.use(multer.any());
app.use(express.json());

// Log the request
app.use(morgan("dev"));

// Determine which domain can access the website
app.use(cors());

// Middleware for cookies
app.use(cookieParser());
// ---------------------

// Initiate Routes
app.use("/goals", goalRoutes);
app.use("/courses", courseRoutes);
app.use("/athenaeums", athenaeumRoutes);
//

// Initiate middlewares (auth, pass)

// ---------------------

// Error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
});

// ---------------------
