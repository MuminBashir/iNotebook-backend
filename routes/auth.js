const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "openinotebook";

// Create a user using POST : (/api/auth/createuser) - no login req
router.post(
  "/createuser",
  [
    check("email", "Enter a valid email").isEmail(),
    check("name", "Enter a valid name").isLength({ min: 3 }),
    check("password", "password should contain atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Try to create a user and store data in database if no error found
    try {
      // To check if a user with email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with this email already exists" });
      }

      //encrypting/hashing password
      const salt = await bcryptjs.genSalt(10);
      const securePassword = await bcryptjs.hash(req.body.password, salt);

      // Storing data in database
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
      });

      //Sending back authToken to user to identify
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.status(200).json({ authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Unexpected error occured");
    }
  }
);

// Authenticating a user using POST : (/api/auth/login) - no login req
router.post(
  "/login",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // check if this email exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ error: "Invalid Credentials" });
      }

      //checking if hashed password matches with user entered password
      const checkPassword = await bcryptjs.compare(password, user.password);
      if (!checkPassword) {
        return res.status(400).send({ error: "Invalid Credentials" });
      }

      //Sending back authToken to user to identify
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.status(200).json({ authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Unexpected error occured");
    }
  }
);
module.exports = router;
