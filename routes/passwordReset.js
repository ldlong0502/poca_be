const { User } = require("../models/User");
const Token = require("../models/Token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");

router.post("/password-reset", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex")
      }).save();
    }

    const link = `${process.env
      .BASE_URL}/password-reset/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);

    res.status(200).send({
      email: user.email,
      message: "password reset link sent to your email account"
    });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

router.get("/password-reset/:userId/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token
    });
    if (!token) return res.status(400).send("Invalid link or expired");
    const newPass = CryptoJS.AES
      .encrypt("123456", process.env.PASS_SEC)
      .toString();
    user.password = newPass;
    await user.save();
    await Token.deleteOne({userId: token.userId});

    res.send("Password reset successfully - New password: 123456");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

module.exports = router;
