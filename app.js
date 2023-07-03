const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const routes = require("./routes");
const session = require("express-session");
const path = require("path");

dotenv.config();

const DB = process.env.DB;
const Secret = process.env.Secret;
app.use(
  session({
    secret: Secret, // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Session expires after 1 min of inactivity.
      expires: 360000,
    },
  })
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use("/", routes); // Mount the routes at the root URL
app.set("trust proxy", 1); // trust first proxy

const port = 3000;

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
