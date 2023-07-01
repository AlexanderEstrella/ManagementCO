const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
});

const companySchema = new mongoose.Schema({
  name: String,
  user: String,
  items: [itemSchema],
});

module.exports = mongoose.model("Company", companySchema);
