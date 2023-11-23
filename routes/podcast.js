const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
} = require("./verifyToken");
const { Podcast } = require("../models/Podcast");
const { Topic } = require("../models/Topic");
const router = require("express").Router();

//GET ALL Episodes
router.get("/", async (req, res) => {
  try {
    const podcasts = await Podcast.find();
    res.status(200).json(podcasts);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách padcasts" });
  }
});

// POST: Tạo podcast mới
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const { title, description, imageUrl, host, topicsList, publishDate } = req.body;
  try {
     const foundTopics = await Topic.find({ _id: { $in: topicsList } });
        
    console.log(foundTopics);
    const newPodcast = new Podcast({
      title,
      description,
      host,
      publishDate,
      imageUrl
    });

    newPodcast.topicsList = foundTopics;

    const savedPodcast = await newPodcast.save();
    res.status(200).json(savedPodcast);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi tạo podcast" });
  }
});

// GET: Lấy chi tiết podcast theo ID
router.get("/:id", async (req, res) => {
  try {
    const podcast  = await Episode.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ error: "Không tìm thấy podcast" });
    }
    res.status(200).json(podcast);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy chi tiết podcast" });
  }
});

// PUT: Cập nhật podcast theo ID

// router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
//   const {
//     title,
//     description,
//     imageUrl,
//     duration,
//     audioFile,
//     publishDate,
//     listens
//   } = req.body;
//   try {
//     const updatedEpisode = await Topic.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         description,
//         imageUrl,
//         duration,
//         audioFile,
//         publishDate,
//         listens
//       },
//       { new: true }
//     );
//     if (!updatedEpisode) {
//       return res.status(404).json({ error: "Không tìm thấy podcast" });
//     }
//     res.status(200).json(updatedEpisode);
//   } catch (err) {
//     res.status(500).json({ error: "Lỗi khi cập nhật podcast" });
//   }
// });
module.exports = router;
