const { Router } = require("express");
const verifyJWT = require("../middlewares/auth.middleware.js");

const {
  createTweet,
  getUserTweets,
  deleteTweet,
  updateTweet,
} = require("../controllers/tweet.controller.js");
const router = Router();
router.route("/createtweet").post(verifyJWT, createTweet);
router.route("/:userId").post(verifyJWT, getUserTweets);
router.route("/delete/:tweetId").post(verifyJWT, deleteTweet);
router.route("/update/:tweetId").put(verifyJWT, updateTweet);

module.exports = router;
