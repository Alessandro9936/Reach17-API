const express = require("express");
const router = express.Router();

const athenaeumController = require("../controllers/athenaeumController");

router.get("/", athenaeumController.athenaeums_list);

router.post("/", athenaeumController.athenaeum_create_post);
router.put("/:id", athenaeumController.athenaeum_update_post);
router.delete("/:id", athenaeumController.athenaeum_delete_post);

router.get("/:id", athenaeumController.athenaeum_detail);

module.exports = router;
