const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const routes = require("./routes");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

dotenv.config();

const DB = process.env.DB;
const secret = process.env.Secret;

// Create a new MongoDBStore instance
const store = new MongoDBStore({
  uri: DB,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log("Session store error:", error);
});

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      expires: 60000, // Session expires after 1 minute of inactivity
    },
  })
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use("/", routes);
app.set("trust proxy", 1);

const port = process.env.PORT || 3000;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTION SUCCESS");
  })
  .catch((err) => {
    console.error("DB CONNECTION ERROR:", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
