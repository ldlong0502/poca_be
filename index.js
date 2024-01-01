const express = require('express');

const app = express();
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const topicRoute = require('./routes/topic');
const episodeRoute = require("./routes/episode");
const podcastRoute = require("./routes/podcast");
const playlistRoute = require("./routes/playlist");
const channelRoute = require("./routes/channel");
const commentRoute = require("./routes/comment");
const resetPassRoute = require("./routes/passwordReset");
dotenv.config();


mongoose.connect(
 process.env.MONGO_URL
).then(() => console.log("DB connect success")).catch((err) => console.log(err));

app.use(express.json());
app.use('/api/users', userRoute);
app.use("/api/auth", authRoute);
app.use("/api/topics", topicRoute);
app.use("/api/podcasts", episodeRoute);
app.use("/api/podcasts", podcastRoute);
app.use("/api/playlists", playlistRoute);
app.use("/api/channel", channelRoute);
app.use("/api/comment", commentRoute);
app.use("/api", resetPassRoute);

app.listen( process.env.PORT || 5000, () => {
    console.log('server is running')
});
