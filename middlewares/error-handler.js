const NODE_ENVIRONEMENT = process.env.NODE_ENV || "development";

/**
 * Extract an error stack or error message from an Error object.
 * @param {Error} error
 * @return {string} - String representation of the error object.
 */
function getErrorMessage(error) {
  if (error.stack) {
    return error.stack;
  }

  if (typeof error.toString === "function") {
    return error.toString();
  }

  return "";
}

/**
 * Determines if an HTTP status code falls in the 4xx or 5xx error ranges.
 * @param {number} statusCode - HTTP status code
 * @return {boolean}
 */
function isErrorStatusCode(statusCode) {
  return statusCode >= 400 && statusCode < 600;
}

/**
 * Log an error message to standard error.
 * @param {string} error
 */
function logErrorMessage(error) {
  console.error(error);
}

/**
 * Look for an error HTTP status code (in order of preference):
 *
 * - Error object (`status` or `statusCode`)
 * - Express response object (`statusCode`)
 *
 * Falls back to a 500 (Internal Server Error) HTTP status code.
 *
 * @param {Object} options
 * @param {Error} options.error
 * @param {Object} options.response - Express response object
 * @return {number} - HTTP status code
 */
function getHTTPStatusCode({ error, response }) {
  // Check if the error object specifies an HTTP status code which we can use
  const statusCodeFromError = error.status || error.statusCode;
  if (isErrorStatusCode(statusCodeFromError)) return statusCodeFromError;

  /**
   * The existing response `statusCode`. This is 200 (OK)
   * by default in Express, but a route handler or
   * middleware might already have set an error HTTP
   * status code (4xx or 5xx).
   */
  const statusCodeFromResponse = response.statusCode;
  if (isErrorStatusCode(statusCodeFromResponse)) return statusCodeFromResponse;

  // Fall back to a generic error HTTP status code.
  return 500;
}

function errorHandlerMiddleware(error, req, res, next) {
  const errorMessage = getErrorMessage(error);

  logErrorMessage(errorMessage);

  // If response headers have already been sent, delegate to default Express error handler
  if (res.headerSent) {
    return next(error);
  }

  const errorResponse = {
    statusCode: getHTTPStatusCode({ error, res }),
    body: undefined,
  };

  //Avoid leaking through error messages and stacks details aboou the application
  if (NODE_ENVIRONEMENT !== "production") {
    errorResponse.body = errorMessage;
  }

  res.status(errorResponse.statusCode).json({ message: errorResponse.body });
}

module.exports = errorHandlerMiddleware;
