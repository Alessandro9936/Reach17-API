const athenaeumServices = require("../services/athenaeumServices");

exports.athenaeums_list = async (req, res, next) => {
  try {
    const athenaeums = await athenaeumServices.athenaeums_list(req.query);
    res.status(200).json({ athenaeums });
  } catch (err) {
    return next(err);
  }
};

exports.athenaeum_create_post = async (req, res, next) => {
  try {
    const newAthenaeum = await athenaeumServices.athenaeum_create_post(req);
    res.status(201).json(newAthenaeum);
  } catch (err) {
    return next(err);
  }
};

exports.athenaeum_update_post = async (req, res, next) => {
  try {
    const updatedAthenaeum = await athenaeumServices.athenaeum_update_post(req);
    res.status(201).json(updatedAthenaeum);
  } catch (err) {
    return next(err);
  }
};

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
