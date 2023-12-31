const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Comment } = require("../models/Comment");
const { Podcast } = require("../models/Podcast");
const router = require("express").Router();

router.get("/podcasts/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const comment = await Comment.find({ podcastId: req.params.id});
    if (!comment) {
      return res.status(404).json({ error: "Không tìm thấy comment" });
    }
    res.status(200).json(comment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết comment" });
  }
});


router.post("", async (req, res) => {
 try {
    const { podcastId, userId, rate, content , createdAt} = req.body;

    const newComment = new Comment({
      podcastId,
      userId,
      rate,
      content,
      createdAt
    });

    await newComment.save();

    res.status(200).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
