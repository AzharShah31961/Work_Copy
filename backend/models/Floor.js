const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    available: {
        type: String,
        enum: ["yes", "no"],
        required: true,
    },
    limit: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Floor", floorSchema);
