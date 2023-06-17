const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Create a user using POST : (/api/auth/)
router.post("/", (req, res) => {
  const user = User(req.body);
  user.save();
  res.send(req.body);
});

module.exports = router;
