const cookieParser = require("cookie-parser");
const express = require("express");
const cors = requir("cors");
const app = express();

app.use({
  origin: process.env.CORS_ORIGIN,
  credential: true,
});
app.use(express.json({ limit: "16kb" }));  //for form data
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // for url  encoded data
app.use(express.static("public"));  // to serve static files css js
app.use(cookieParser());

module.exports = app;
