const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.redirect("/documentations");
});

module.exports = router;
