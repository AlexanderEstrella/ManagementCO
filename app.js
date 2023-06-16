const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const routes = require("./routes");

dotenv.config();

const DB = process.env.DB;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("Public"));
app.use("/", routes); // Mount the routes at the root URL

const port = 7000;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB CONNECTION SUCCESS");
  })
  .catch((err) => {
    console.error("DB CONNECTION ERROR:", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
