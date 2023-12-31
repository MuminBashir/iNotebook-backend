const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "openinotebook";

// Route 1 :: Create a user using: POST "/api/auth/createuser" - no login req
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
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    // Try to create a user and store data in database if no error found
    try {
      // To check if a user with email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
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
      success = true;
      res.status(200).json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Unexpected error occured");
    }
  }
);

// Route 2 :: Authenticating a user using: POST "/api/auth/login" - no login req
router.post(
  "/login",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // check if this email exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, error: "Invalid Credentials" });
      }

      //checking if hashed password matches with user entered password
      const checkPassword = await bcryptjs.compare(password, user.password);
      if (!checkPassword) {
        return res.status(400).json({ success, error: "Invalid Credentials" });
      }

      //Sending back authToken to user to identify
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.status(200).json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Unexpected error occured");
    }
  }
);

// Route 3 :: Fetch a logged-in user details using: POST "/api/auth/getuser" - login req
router.post("/getuser", fetchuser, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    success = true;
    res.status(200).json({ success, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unexpected error occured");
  }
});
module.exports = router;
