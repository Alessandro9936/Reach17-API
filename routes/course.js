const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const Course = require("../models/courseModel");
const validationMiddleware = require("../middlewares/input-validator");

router.get("/", courseController.courses_list);

router.post(
  "/",
  validationMiddleware(Course),
  courseController.course_create_post
);
router.put(
  "/:id",
  validationMiddleware(Course),
  courseController.course_update_post
);
router.delete("/:id", courseController.course_delete_post);

router.get("/:id", courseController.course_detail);

module.exports = router;
