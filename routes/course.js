const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");

router.get("/", courseController.courses_list);

router.post("/", courseController.course_create_post);
router.put("/:id", courseController.course_update_post);
router.delete("/:id", courseController.course_delete_post);

router.get("/:id", courseController.course_detail);

module.exports = router;
