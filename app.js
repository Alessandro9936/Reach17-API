// Import all dependecies
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const multer = require("multer")();
const compression = require("compression");
const helmet = require("helmet");

const createHTTPError = require("http-errors");

// Import middlewares
const errorHandlerMiddleware = require("./middlewares/error-handler");

// Initiate app with express
const app = express();
const connectDB = require("./configs/db.config");

// Import and connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
  app.listen(process.env.PORT || 3000);
}

// Import Routes

const goalRoutes = require("./routes/goal");
const courseRoutes = require("./routes/course");
const athenaeumRoutes = require("./routes/athenaeum");
const indexRoutes = require("./routes/index");

// Initiate App Middlewares

// Use gzip compression to decrease the size of the response body and increase speed of app
app.use(compression());

// Use helmet to procect against well known vulnerabilities
app.use(helmet());

// Parses incoming requests
app.use(multer.any());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log the request
app.use(morgan("dev"));
// ---------------------

// Initiate Routes
app.use("/", indexRoutes);
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
