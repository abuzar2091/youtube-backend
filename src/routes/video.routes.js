const { Router } = require("express");
const { upload } = require("../middlewares/multer.middleware.js");
const verifyJWT = require("../middlewares/auth.middleware.js");
const { publishAVideo, getVideoById, getAllVideos, updateVideo, deleteVideo } = require("../controllers/video.controller.js");
const router = Router();
router.route("/allvideos").post(
    verifyJWT,
    getAllVideos,
  );
router.route("/publishvideo").post(
    verifyJWT,
    upload.single("videoFile"),
    publishAVideo
  );
  router.route("/:videoId").post(
    verifyJWT,
    getVideoById,
  );
  router.route("/update/:videoId").put(
    verifyJWT,
    updateVideo,
  );
  
  router.route("/delete/:videoId").put(
    verifyJWT,
    deleteVideo,
  );
module.exports = router;