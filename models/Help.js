const mongoose = require("mongoose");

const help_schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lattitude: { type: String, required: true },
    longitutde: { type: String, required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hospital_name: { type: String },
    issue: { type: String },
    urgency: { type: Number },
    tip: { type: Number },
});

const Help = mongoose.model("Help", help_schema);

module.exports = { Help };
