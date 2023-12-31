const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Playlist } = require("../models/Playlist");
const { User } = require("../models/User");
const { Episode } = require("../models/Episode");
const router = require("express").Router();

router.get("/:userId", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Sử dụng Mongoose để truy vấn cơ sở dữ liệu
    const playlists = await Playlist.find({ "userId": userId });

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

    const playlist = new Playlist({
      name,
      description,
      episodesList,
      imageUrl,
      userId
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

router.put("/:userId/:playlistId", async (req, res) => {
  const userId = req.params.userId;
  const playlistId = req.params.playlistId;
  const { name, description, episodesList, imageUrl } = req.body;

  try {
    // Tìm và cập nhật playlist dựa trên cả userId và playlistId
    const playlist = await Playlist.findOneAndUpdate(
      { userId, _id: playlistId },
      { name, description, episodesList, imageUrl },
      { new: true }
    );

    // Kiểm tra xem playlist có tồn tại không
    if (playlist) {
      res.status(200).json(playlist);
    } else {
      res.status(404).json({ message: "Playlist không tồn tại" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});


router.delete("/:userId/:playlistId", async (req, res) => {
  const userId = req.params.userId;
  const playlistId = req.params.playlistId;

  try {
    // Tìm và xóa playlist dựa trên cả userId và playlistId
    const deletedPlaylist = await Playlist.findOneAndRemove({
      userId,
      _id: playlistId
    });

    // Kiểm tra xem playlist đã bị xóa thành công hay không
    if (deletedPlaylist) {
      res.status(200).json({ message: "Playlist đã bị xóa thành công" });
    } else {
      res.status(404).json({ message: "Playlist không tồn tại" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/:playlistId/addEpisode/:episodeId", async (req, res) => {
  try {
    const { playlistId, episodeId } = req.params;

    // Kiểm tra xem playlist và episode có tồn tại không
    const playlist = await Playlist.findById(playlistId);
    const episode = await Episode.findById(episodeId);

    if (!playlist || !episode) {
      return res
        .status(404)
        .json({ message: "Playlist or episode not found." });
    }

    // Thêm episode vào danh sách episodes của playlist
    playlist.episodesList.push(episodeId);

    // Lưu playlist sau khi thêm episode
    await playlist.save();

    res
      .status(200)
      .json({ message: "Episode added to playlist successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = router;