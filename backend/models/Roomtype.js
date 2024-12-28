const mongoose = require("mongoose");

const roomtypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    halfdayprice: {
        type: Number,
        required: true,
    },
    fulldayprice: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Roomtype", roomtypeSchema);
