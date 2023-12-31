const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const {User } = require("../models/User");
const router = require('express').Router();

//UPDATE USER
router.put("/:id", verifyTokenAndAuthorization , async (req, res) => {

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {$set: req.body} , {new: true});
     res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE USER
router.delete("/:id", verifyTokenAndAdmin , async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  try {
     console.log(req.params.id);
    const user = await User.findById(req.params.id);
    const { orgPassword, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//GET ALL USERS
router.get("/", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(deletedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;