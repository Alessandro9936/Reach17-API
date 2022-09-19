const courseServices = require("../services/courseServices");

exports.courses_list = async (req, res, next) => {
  // Keep only filter query and remove other type of queries
  const reqQuery = { ...req.query };
  const removeFields = ["sort", "limit"];
  removeFields.forEach((value) => delete reqQuery[value]);

  try {
    const courses = await courseServices.course_list(reqQuery);
    res.status(200).json({ courses });
  } catch (error) {
    return next(error);
  }
};

exports.course_create_post = async (req, res, next) => {
  try {
    const newCourse = await courseServices.course_create_post(req);
    res.status(201).json(newCourse);
  } catch (error) {
    return next(error);
  }
};

exports.course_update_post = async (req, res, next) => {
  try {
    const updatedCourse = await courseServices.course_update_post(req);
    res.status(201).json(updatedCourse);
  } catch (err) {
    return next(err);
  }
};

exports.course_delete_post = async (req, res, next) => {
  try {
    await courseServices.course_delete_post(req);
    res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

exports.course_detail = async (req, res, next) => {
  try {
    const course = await courseServices.course_detail(req);
    res.status(200).json(course);
  } catch (err) {
    return next(err);
  }
};
