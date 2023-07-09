const express = require("express");
const app = express();
const router = express.Router();
const date = require("../date");
const Item = require("../models/item");
const Company = require("../models/company");
const User = require("../models/user");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const checkAuthentication = (req, res, next) => {
  // Check if the user is logged in
  if (req.session.user) {
    // User is authenticated, allow access to the next middleware or route handler
    next();
  } else {
    req.session.message = "Access denied, please login or register"; // Set the message in the session
    res.redirect("/login"); // Redirect to the login page
  }
};

const item1 = new Item({
  name: "Welcome to your Credentials Manager!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "Hit box to delete an item",
});
const item4 = new Item({
  name: "Hit the pencil to update an item",
});

const defaultItems = [item1, item2, item3, item4];

router.get("/login", (req, res) => {
  const message = req.session.message; // Retrieve the message from the session
  req.session.message = null; // Clear the message from the session
  res.render("login", { message }); //
});
router.get("/register", (req, res) => {
  res.render("register");
});

router.get(
  "/update/:itemId/:companyName",
  checkAuthentication,
  async (req, res) => {
    const username = req.session.user;
    const itemId = req.params.itemId;
    const companyName = req.params.companyName;

    // find company and item id
    try {
      req.session.user = username;
      const findItem = await Company.findOne(
        { name: companyName, user: username },
        {
          items: { $elemMatch: { _id: itemId } },
        }
      );
      // if found set retrieve and render these values
      if (findItem) {
        const itemtoupdate = findItem.items[0].name; // Retrieve the item name
        res.render("update.ejs", {
          itemId: itemId,
          companyName: companyName,
          itemtoupdate: itemtoupdate,
        });
      } else {
        // Handle case when the item is not found
        res.status(404).json({ error: "Item not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch item from DB" });
    }
  }
);

router.post("/update", checkAuthentication, async (req, res) => {
  const username = req.session.user;
  const itemId = req.body.itemId;
  const companyName = req.body.companyName;
  const inputValue = req.body.itemtobeupdated;

  try {
    req.session.user = username;
    // find company and filter by item.id

    await Company.findOneAndUpdate(
      { name: companyName, user: username, "items._id": itemId },
      // set value to the input
      { $set: { "items.$.name": inputValue } }
    );

    res.redirect(`/${companyName}`); // Redirect to the home page or wherever appropriate
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update item in DB" });
  }
});

router.get("/", checkAuthentication, async (req, res) => {
  try {
    const username = req.session.user;
    let day = date.getDate();
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
    }
    const foundCompanies = await Company.find({ user: username });
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

router.get("/company", (req, res) => {
  res.render("company");
});

router.post("/company", checkAuthentication, async (req, res) => {
  const username = req.session.user;
  req.session.user = username;
  const foundCompanies = await Company.find({ user: username });
  const companyName = req.body.newcompany;

  // Check if the requested URL parameter is not "favicon.ico"
  if (
    companyName &&
    companyName.toLowerCase() !== "searchicon.png" &&
    companyName.toLowerCase() !== "favicon.ico"
  ) {
    // Capitalize the first letter of the requested parameter
    const customizedItem = companyName[0].toUpperCase() + companyName.slice(1);
    try {
      // Find a company in the database with the customizedItem as the name
      const foundCompany = await Company.findOne({
        name: customizedItem,
        user: username,
      });
      if (!foundCompany) {
        // If no company is found, create a new company with the customizedItem and defaultItems
        const company = new Company({
          name: customizedItem,
          user: username,
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
        if (foundCompany !== null) {
          res.render("home", {
            CompanyName: foundCompany.name,
            newListItems: foundCompany.items,
            foundcompanies: foundCompanies,
          });
        } else {
          res.status(404).json({ error: "Company not found" });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch items from DB" });
    }
  }
});

router.get("/:any", checkAuthentication, async (req, res) => {
  const username = req.session.user;
  req.session.user = username;
  const foundCompanies = await Company.find({ user: username });

  // Check if the requested URL parameter is not "favicon.ico"
  if (
    req.params.any.toLowerCase() !== "searchicon.png" &&
    req.params.any.toLowerCase() !== "favicon.ico"
  ) {
    // Capitalize the first letter of the requested parameter
    const customizedItem =
      req.params.any[0].toUpperCase() + req.params.any.slice(1);
    try {
      // Find a company in the database with the customizedItem as the name

      const foundCompany = await Company.findOne({
        name: customizedItem,
        user: username,
      });
      if (!foundCompany) {
        // If no company is found, create a new company with the customizedItem and defaultItems
        const company = new Company({
          name: customizedItem,
          user: username,
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
        if (foundCompany !== null) {
          res.render("home", {
            CompanyName: foundCompany.name,
            newListItems: foundCompany.items,
            foundcompanies: foundCompanies,
          });
        } else {
          res.status(404).json({ error: "Company not found" });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch items from DB" });
    }
  }
});

router.post("/delete", checkAuthentication, async (req, res) => {
  const username = req.session.user;
  req.session.user = username;

  const Idofsoontobedel = req.body.Checkeditem;
  const Currentcomp = req.body.companyNames;
  try {
    await Company.findOneAndUpdate(
      { name: Currentcomp, user: username },
      { $pull: { items: { _id: Idofsoontobedel } } }
    );
    res.redirect("/" + Currentcomp);
  } catch (err) {
    console.log(err);
  }
});

router.post("/", checkAuthentication, async (req, res) => {
  const username = req.session.user;
  req.session.user = username;
  const itemofsoontocreated = req.body.newItem;
  const Currentcomp = req.body.newcompany;
  const newItem = new Item({
    name: itemofsoontocreated,
  });
  try {
    const foundcomp = await Company.findOneAndUpdate(
      { name: Currentcomp, user: username },
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

router.post("/register", async (req, res) => {
  const user = req.body.username;
  const password = req.body.password;
  const username = user.toLowerCase();
  const saltRounds = process.env.salRounds;

  try {
    // Generate a salt
    const foundUser = await User.findOne({ email: username });
    if (foundUser) {
      res.json({ error: "User already exist, please go to /login" });
    } else {
      const salt = await bcrypt.genSalt(saltRounds);

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        email: username,
        password: hashedPassword,
      });

      // Save the new user to the database
      await newUser.save();

      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req, res) => {
  const user = req.body.username;
  const password = req.body.password;
  const username = user.toLowerCase();
  try {
    const foundUser = await User.findOne({ email: username });
    if (!foundUser) {
      // User does not exist, render an error message or redirect to register page
      res.json({ error: "User does not exist, please go to /register" });
    } else {
      // User found, check password
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (passwordMatch) {
        req.session.user = username; // Store the username in the session

        res.redirect("/");
      } else {
        // Password is incorrect, render an error message or redirect to login page
        res.json({ error: "Incorrect password" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
