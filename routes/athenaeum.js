const express = require("express");
const router = express.Router();

const athenaeumController = require("../controllers/athenaeumController");
const Athenaeum = require("../models/athenaeumModel");
const validationMiddleware = require("../middlewares/input-validator");

router.get("/", athenaeumController.athenaeums_list);

router.post(
  "/",
  validationMiddleware(Athenaeum),
  athenaeumController.athenaeum_create_post
);
router.put(
  "/:id",
  validationMiddleware(Athenaeum),
  athenaeumController.athenaeum_update_post
);
router.delete("/:id", athenaeumController.athenaeum_delete_post);

router.get("/:id", athenaeumController.athenaeum_detail);

module.exports = router;
