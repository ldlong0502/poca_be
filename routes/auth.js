const router = require("express").Router();
const { User } = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, fullName, dateOfBirth } = req.body;

    const checkUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    if(checkUser) {
      return res.status(401).json('User already exists');
    }
    const user = new User({
      username: username,
      password: CryptoJS.AES
        .encrypt(password, process.env.PASS_SEC)
        .toString(),
      email: email,
      fullName: fullName,
      dateOfBirth: Date(dateOfBirth)
    });

    await user.save();

    res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(401).json("Wrong credentials");
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const passwordUser = hashedPassword.toString(CryptoJS.enc.Utf8);
    if(passwordUser !== password) {
      res.status(401).json("Wrong credentials");
      return;
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SEC_REFRESH
    );
    refreshTokens.push(refreshToken);
    const { orgPassword, ...data } = user._doc;

    res.status(200).json({ data, accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.body.token;

    if (!refreshToken) return res.status(401).json('Token is not existed');
    jwt.verify(refreshToken, process.env.JWT_SEC_REFRESH, (err, user) => {
      if (err)  return res.status(403).json("Token is not valid");
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
      );
      console.log(accessToken);
      return res.status(200).json({ accessToken: accessToken });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});
module.exports = router;
