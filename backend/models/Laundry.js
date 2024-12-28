const mongoose = require("mongoose");

const laundrySchema = new mongoose.Schema({
    object: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ["Clothing Items", "Bed & Bath Linen","Special Items", "Additional Services"],
        required: true,
    },
    pricing: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Laundry", laundrySchema);
