const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const Topic = require("../models/Topic");
const router = require("express").Router();

//GET ALL TOPICS
router.get("/" , async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách chủ đề" });
  }
});

// POST: Tạo chủ đề mới
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const { name, description, imageUrl } = req.body;
  try {
    const newTopic = new Topic({ name, description, imageUrl });
    const savedTopic = await newTopic.save();
    res.status(200).json(savedTopic);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tạo chủ đề" });
  }
});

// GET: Lấy chi tiết chủ đề theo ID
router.get("/:id", async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: "Không tìm thấy chủ đề" });
    }
    res.status(200).json(topic);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết chủ đề" });
  }
});

// PUT: Cập nhật chủ đề theo ID
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      { name, description , imageUrl },
      { new: true }
    );
    if (!updatedTopic) {
      return res.status(404).json({ error: "Không tìm thấy chủ đề" });
    }
    res.status(200).json(updatedTopic);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật chủ đề" });
  }
});
module.exports = router;
