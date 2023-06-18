const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const { check, validationResult } = require("express-validator");
const Notes = require("../models/Notes");
const router = express.Router();

// Route 1 :: Fetch all notes using: GET "/api/notes/getallnotes" - login req
router.get("/getallnotes", fetchuser, async (req, res) => {
  try {
    // fetching notes using user id
    const notes = await Notes.find({ user: req.user.id });
    res.status(200).json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unexpected error occured");
  }
});

// Route 2 :: Add notes using: POST "/api/notes/addnotes" - login req
router.post(
  "/addnotes",
  [
    check("title", "Title can't be blank").exists(),
    check("description", "Description can't be blank").exists(),
  ],
  fetchuser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // add notes to database
    const { title, description, tag } = req.body;
    try {
      const notes = await Notes.create({
        title,
        description,
        tag,
        user: req.user.id,
      });
      res.status(200).json(notes);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Unexpected error occured");
    }
  }
);
module.exports = router;
