const express = require("express");
const router = express.Router();
const date = require("../date");
const Item = require("../models/item");
const Company = require("../models/company");
const item1 = new Item({
  name: "Welcome to your Credentials Manager!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<---Hit this to delete an item",
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
    const foundCompanies = await Company.find({});
    res.render("home", {
      CompanyName: day,
      newListItems: foundItems,
      foundcompanies: foundCompanies,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch items from DB" });
  }
});

router.get("/:any", async (req, res) => {
  const foundCompanies = await Company.find({});
  // Check if the requested URL parameter is not "favicon.ico"
  if (req.params.any !== "favicon.ico") {
    // Capitalize the first letter of the requested parameter
    const customizedItem =
      req.params.any[0].toUpperCase() + req.params.any.slice(1);
    try {
      // Find a company in the database with the customizedItem as the name
      const foundCompany = await Company.findOne({ name: customizedItem });
      if (!foundCompany) {
        // If no company is found, create a new company with the customizedItem and defaultItems
        const company = new Company({
          name: customizedItem,
          items: defaultItems,
        });
        await company.save();
        // Render the "home" template with the customizedItem and defaultItems
        res.render("home", {
          CompanyName: customizedItem,
          newListItems: defaultItems,
          foundcompanies: foundCompanies,
        });
      } else {
        // If a company is found, render the "home" template with the foundCompany's name and items
        res.render("home", {
          CompanyName: foundCompany.name,
          newListItems: foundCompany.items,
          foundcompanies: foundCompanies,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch items from DB" });
    }
  }
});

router.post("/delete", async (req, res) => {
  console.log("item.id:", req.body.Checkeditem);
  const Idofsoontobedel = req.body.Checkeditem;
  const Currentcomp = req.body.companyNames;
  try {
    await Company.findOneAndUpdate(
      { name: Currentcomp },
      { $pull: { items: { _id: Idofsoontobedel } } }
    );
    res.redirect("/" + Currentcomp);
  } catch (err) {
    console.log(err);
  }
});

router.post("/", async (req, res) => {
  const itemofsoontocreated = req.body.newItem;
  const Currentcomp = req.body.newcompany;
  const newItem = new Item({
    name: itemofsoontocreated,
  });
  try {
    const foundcomp = await Company.findOneAndUpdate(
      { name: Currentcomp },
      { $push: { items: newItem } },
      { new: true }
    );
    if (foundcomp) {
      res.redirect("/" + Currentcomp);
    } else {
      // Handle case when the company is not found
      res.status(404).send("Company not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
