const { body, validationResult } = require("express-validator");
const Athenaeum = require("../models/athenaeumModel");

const athenaeumServices = require("../services/athenaeumServices");

exports.athenaeums_list = async (req, res, next) => {
  try {
    const athenaeums = await athenaeumServices.athenaeums_list(req.query);
    res.status(200).json({ athenaeums });
  } catch (err) {
    return next(err);
  }
};

exports.athenaeum_create_post = [
  body("name")
    .notEmpty()
    .withMessage("Athenaeum name field must not be empty")
    .isAlphanumeric()
    .withMessage("field must contain only letters or numbers")
    .custom(async (value) => {
      const existingAthenaeum = await Athenaeum.findOne({ name: value });
      if (existingAthenaeum) {
        throw new Error(`${value} already exists`);
      }
    })
    .escape(),

  async (req, res, next) => {
    try {
      // Check if validation returned errors
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const newAthenaeum = await athenaeumServices.athenaeum_create_post(req);
      res.status(201).json(newAthenaeum);
    } catch (err) {
      return next(err);
    }
  },
];

exports.athenaeum_update_post = [
  body("name")
    .notEmpty()
    .withMessage("Name field must not be empty")
    .isAlphanumeric()
    .withMessage("field must contain only letters or numbers")
    .escape(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // If validation result got errors return them
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const updatedAthenaeum = await athenaeumServices.athenaeum_update_post(
        req
      );
      res.status(201).json(updatedAthenaeum);
    } catch (err) {
      return next(err);
    }
  },
];

exports.athenaeum_delete_post = async (req, res, next) => {
  try {
    await athenaeumServices.athenaeum_delete_post(req);
    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

exports.athenaeum_detail = async (req, res, next) => {
  try {
    const athenaeum = await athenaeumServices.athenaeum_detail(req);

    res.status(200).json(athenaeum);
  } catch (err) {
    return next(err);
  }
};
