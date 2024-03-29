
const express = require("express");
const app = express();
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({path: "./.env"});
  }
const connectDB = require("./db/index.js");
const port=process.env.PORT;
connectDB()
.then(()=>{
     app.listen(port,()=>{
        console.log(`Port is listening on port ${port}`);
     })
})
.catch(err => console.log("MONGODB connection failed ",err));

// (async () => {
//   try {
//     mongoose.connect(`
//             ${process.env.MONGODB_URI}/${DB_NAME}`);

//     app.on("error", (error) => {
//       console.log("port is not listening", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("Error in connecting to DB");
//   }
// })();
