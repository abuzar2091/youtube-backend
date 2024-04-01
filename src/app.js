const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credential: true,
}));
app.use(express.json({ limit: "16kb" }));  //for form data
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for url  encoded data
app.use(express.static("public"));  // to serve static files css js
app.use(cookieParser());

 const userRouter=require('./routes/user.routes.js');
 const videoRouter=require('./routes/video.routes.js');
 const playlistRouter=require('./routes/playlist.routes.js');
 const commentRouter=require('./routes/comment.routes.js');
 const likeRouter=require('./routes/like.routes.js');
 const dashboardRouter=require('./routes/dashboard.routes.js');
 const healthcheckRouter=require('./routes/healthcheck.routes.js');
app.use("/users",userRouter)
app.use("/videos",videoRouter)
app.use("/playlist",playlistRouter);
app.use("/comment",commentRouter);
app.use("/like",likeRouter)
app.use("/dashboard",dashboardRouter)
app.use("/health",healthcheckRouter)
module.exports = {app};
