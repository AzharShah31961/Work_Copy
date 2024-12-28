const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["breakfast", "starter", "main", "deserts", "beverages"],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Food", foodSchema);
