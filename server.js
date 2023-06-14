const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const date = require("./date");
const Item = require("./models/item");
const Company = require("./models/company");

dotenv.config({ path: "./config.env" });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("Public"));

const port = 7000;

const item1 = new Item({
  name: "welcome to your crendentials manager!",
});

const item2 = new Item({
  name: "hit the + button to add a new item",
});
const item3 = new Item({
  name: "<---hit this to delete an item",
});
const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  let day = date.getDate();
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Successfully saved default items to DB");
          })
          .catch((err) => {
            console.log(err);
            res
              .status(500)
              .json({ error: "Failed to save default items to DB" });
          });
      } else {
        res.render("home", { CompanyName: day, newListItems: foundItems });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch items from DB" });
    });
});

// checking if a list already exists and creating more lists
app.get("/:any", async (req, res) => {
  if (req.params.any !== "favicon.ico") {
    const customized = req.params.any;
    const customizedItem = customized[0].toUpperCase() + customized.slice(1);
    //finding a if company exist
    try {
      const foundCompany = await Company.findOne({ name: customizedItem });
      //if company does not exist create a new entry with the default items
      if (!foundCompany) {
        const company = new Company({
          name: customizedItem,
          items: defaultItems,
        });
        //wait for the reconrd to be entered
        await company.save();
        res.render("home", {
          CompanyName: customizedItem,
          newListItems: defaultItems,
        });
      } else {
        res.render("home", {
          CompanyName: foundCompany.name,
          newListItems: foundCompany.items,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch items from DB" });
    }
  }
});

const DB =
  "mongodb+srv://alexanderestrella23:CyPp77LnOC93iqYA@cluster0.ohq58lm.mongodb.net/Cmtmanager";
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
