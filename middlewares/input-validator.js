const { body, validationResult } = require("express-validator");

const validatorMiddleware = (model) => [
  body("name")
    .notEmpty()
    .withMessage("Name field must not be empty")
    .custom(async (value) => {
      const existingValue = await model.findOne({ name: value });
      if (existingValue) {
        throw new Error(`${value} already exists`);
      }
    })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    // If validation result got errors throw them to be handled
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
];

module.exports = validatorMiddleware;
