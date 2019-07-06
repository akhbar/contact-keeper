const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../models/User.js");
const Contact = require("../models/Contact.js");

// @routes GET api/contacts
// @desc Get all users contacts
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @routes POST api/contacts
// @desc Add new contact
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id
      });
      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @routes PUT api/contacts/:id
// @desc Add new contact
// @access Private
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // build contact object
  const contactFieds = {};
  if (name) contactFieds.name = name;
  if (email) contactFieds.email = email;
  if (phone) contactFieds.phone = phone;
  if (type) contactFieds.type = type;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact Not Found" });
    // Make sure user owns contact

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Autherized" });
    }
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $set: contactFieds
      },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @routes DELETE api/contacts/:id
// @desc  Delete contact
// @access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact Not Found" });
    // Make sure user owns contact

    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not Autherized" });
    }
    await Contact.findByIdAndRemove(req.params.id);
    res.json({ msg: "Contact Remove" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
