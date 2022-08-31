const express = require("express");
const router = express.Router();

const goalController = require("../controllers/goalController");

router.get("/", goalController.goals_list);

router.post("/", goalController.goal_create_post);
router.put("/:id", goalController.goal_update_post);
router.delete("/:id", goalController.goal_delete_post);

router.get("/:id", goalController.goal_detail);

module.exports = router;
