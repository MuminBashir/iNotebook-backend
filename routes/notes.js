const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const { check, validationResult } = require("express-validator");
const Notes = require("../models/Notes");
const router = express.Router();

// Route 1 :: Fetch all notes using: GET "/api/notes/getallnotes" - login req
router.get("/getallnotes", fetchuser, async (req, res) => {
  let success = false;
  try {
    // fetching notes using user id
    const notes = await Notes.find({ user: req.user.id });
    success = true;
    res.status(200).json({ success, notes });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unexpected error occured");
  }
});

// Route 2 :: Add notes using: POST "/api/notes/addnote" - login req
router.post(
  "/addnote",
  [
    check("title", "Title can't be blank").exists(),
    check("description", "Description can't be blank").exists(),
  ],
  fetchuser,
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
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
      success = true;
      res.status(200).json({ success, notes });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Unexpected error occured");
    }
  }
);

// Route 3 :: Update existing note using: PUT "/api/notes/updatenote/:id" - login req
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const { title, description, tag } = req.body;

    // create new note
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //find note to update and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success, error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ success, error: "Access Denied" });
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    success = true;
    res.status(200).json({ success, note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unexpected error occured");
  }
});

// Route 4 :: Deleting existing note using: DELETE "/api/notes/deletenote/:id" - login req
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    //find note to delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success, error: "Note not found" });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ success, error: "Access Denied" });
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    success = true;
    res.status(200).json({ success, note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Unexpected error occured");
  }
});

module.exports = router;
