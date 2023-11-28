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
router.get("/findByTopic/:topicId", async (req, res) => {
  
  try {
    var list = [];
  const podcasts = await Podcast.find({
      "topicsList._id": req.params.topicId
    }).exec();
    res.status(200).json(podcasts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách podcast theo topic" });
  }
});


//search podcast
router.get("/search", async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm." });
    }

    const regex = new RegExp(keyword, "i"); // Tìm kiếm không phân biệt chữ hoa chữ thường

    const podcasts = await Podcast.find({
      $or: [{ title: { $regex: regex } }, { host: { $regex: regex } }]
    });

    res.status(200).json(podcasts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tìm kiếm podcast." });
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
    const podcast  = await Podcast.findById(req.params.id);
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
