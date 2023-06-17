const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Create a user using POST : (/api/auth/)
router.post(
  "/",
  [
    check("email", "Enter a valid email").isEmail(),
    check("name", "Enter a valid name").isLength({ min: 3 }),
    check("password", "password should contain atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    })
      .then((user) => res.status(200).json(user))
      .catch((err) => res.status(400).json({ error: err.message }));
  }
);

module.exports = router;
