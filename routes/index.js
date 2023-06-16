const express = require("express");
const router = express.Router();
const date = require("../date");
const Item = require("../models/item");
const Company = require("../models/company");
const item1 = new Item({
  name: "welcome to your credentials manager!",
});

const item2 = new Item({
  name: "hit the + button to add a new item",
});

const item3 = new Item({
  name: "<---hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

router.get("/", async (req, res) => {
  try {
    let day = date.getDate();
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Successfully saved default items to DB");
    }
    res.render("home", {
      CompanyName: day,
      newListItems: foundItems,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch items from DB" });
  }
});

router.get("/:any", async (req, res) => {
  if (req.params.any !== "favicon.ico") {
    const customizedItem =
      req.params.any[0].toUpperCase() + req.params.any.slice(1);
    try {
      const foundCompany = await Company.findOne({ name: customizedItem });
      if (!foundCompany) {
        const company = new Company({
          name: customizedItem,
          items: defaultItems,
        });
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

router.get("/companies", async (req, res) => {
  try {
    const foundcompanies = await Company.find({});
    res.render("home", { foundcomp: foundcompanies });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch companies from DB" });
  }
});

module.exports = router;
