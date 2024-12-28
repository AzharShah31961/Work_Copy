const mongoose = require("mongoose");
const axios = require("axios");

const foodorderSchema = new mongoose.Schema({
    foodid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/food/${value}`);
                    return !!response.data;
                } catch {
                    return false;
                }
            },
            message: "Invalid Food ID.",
        },
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    bill: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["recieved", "gettingready", "read", "delivered"],
        default: "recieved",
    },
    paymentstatus: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid",
    },
    type: {
        type: String,
        enum: ["dinein", "takeaway", "roomserve"],
        required: true,
    },
    ordertime: {
        type: Date,
        default: () => new Date(),
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        validate: {
            validator: async function (value) {
                if (this.type !== "roomserve") return true;
                try {
                    const response = await axios.get(`http://localhost:5000/api/room/${value}`);
                    return response.data?.available === "no";
                } catch {
                    return false;
                }
            },
            message: "Invalid Room ID or Room not booked.",
        },
    },
    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/guest/${value}`);
                    return !!response.data;
                } catch {
                    return false;
                }
            },
            message: "Invalid Guest ID.",
        },
    },
});

// Pre-save middleware for calculating the bill
foodorderSchema.pre("save", async function (next) {
    try {
        const foodResponse = await axios.get(`http://localhost:5000/api/food/${this.foodid}`);
        const food = foodResponse.data;

        if (!food) throw new Error("Invalid Food ID.");
        this.bill = this.quantity * food.price;
    } catch (err) {
        return next(err);
    }
    next();
});

module.exports = mongoose.model("FoodOrder", foodorderSchema);
