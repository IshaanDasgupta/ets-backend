const mongoose = require("mongoose");

const help_schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hospital_name: { type: String },
    issue: { type: String },
    urgency: { type: Number },
    tip: { type: Number },
});

const Help = mongoose.model("Help", help_schema);

module.exports = { Help };
