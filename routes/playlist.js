const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Playlist } = require("../models/Playlist");
const { User } = require("../models/User");
const router = require("express").Router();

router.get("/:userId", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Sử dụng Mongoose để truy vấn cơ sở dữ liệu
    const playlists = await Playlist.find({ "user._id": userId });

    // Kiểm tra xem có playlists không
    if (!playlists) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy playlists cho người dùng này" });
    }

    console.log(playlists);
    return res.status(200).json(playlists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});


router.post("/:userId", async (req, res) => {
    const userId = req.params.userId;
  const { name, description, episodesList, imageUrl } = req.body;

  try {

    const user = await User.findById(userId);

    const playlist = new Playlist({
      name,
      description,
      episodesList,
      imageUrl,
      user: user
    });

    // Lưu playlist vào cơ sở dữ liệu
    const savedPlaylist = await playlist.save();

    // Trả về playlist đã tạo
    res.status(200).json(savedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
module.exports = router;