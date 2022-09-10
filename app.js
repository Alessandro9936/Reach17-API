// Import all dependecies
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer")();

const createHTTPError = require("http-errors");

// Import middlewares
const errorHandlerMiddleware = require("./middlewares/error-handler");

// Initiate app with express
const app = express();
app.listen(process.env.PORT || 3000);

// Import and connect DB
const connectDB = require("./configs/db.config");
connectDB();

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

// Handle error if the routes not found or there's problem in DB connection
app.use((req, res, next) => {
  next(createHTTPError(404, "Page Not Found"));
});

// Error handler
app.use(errorHandlerMiddleware);
// ---------------------

module.exports = app;
