const mongoose = require("mongoose");

const user_schema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_no: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    address: { type: String, required: true },
    dob: { type: String, required: true },
    blood_type: { type: String, enum: ["A+", "B+", "AB+"] },
    emergency_contact: {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        phone_no: { type: String, required: true },
        relation: { type: String, required: true },
    },
    vehicle_details: {
        type: {
            name: { type: String, required: true },
            number: { type: String, required: true },
            color: { type: String, required: true },
        },
        required: false,
    },
});

const User = mongoose.model("User", user_schema);

module.exports = { User };
