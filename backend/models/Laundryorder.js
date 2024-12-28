const mongoose = require("mongoose");
const axios = require("axios");

const laundryorderSchema = new mongoose.Schema({
    laundryid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    const response = await axios.get("http://localhost:5000/api/laundry/");
                    const validLaundrys = response.data.map(laundry => laundry._id);
                    return validLaundrys.includes(value.toString());
                } catch (err) {
                    console.error("Error fetching laundry item:", err);
                    return false;
                }
            },
            message: (props) => `${props.value} is not a valid Laundry Item ID.`,
        },
    },
    quantity: {
        type: Number,
        required: true,
    },
    bill: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["pending","gettingwashed", "drying", "ready"],
    },
    paymentstatus :{
        type: String,
        enum: ["paid","unpaid"],
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/room/${value}`);
                    
                    // Check if the response contains valid data and 'available' is 'no'
                    return response.data && response.data.available === 'no';
                } catch (error) {
                    return false; // Return false if the request fails
                }
            },
            message: "Invalid Room ID or the room is not booked by anyone.",
        },
    },    
    ordertime: {
        type: Date,
        default: () => new Date(),
    },
    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        validate: {
            validator: async function (value) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/guest/${value}`);
                    return !!response.data;
                } catch (error) {
                    return false;
                }
            },
            message: "Invalid Guest ID.",
        },
    },
});

// Middleware to enforce current ordertime and dynamic bill calculation
laundryorderSchema.pre("save", async function (next) {
    this.ordertime = new Date(); // Override with the current time

    try {
        // Fetch the laundry item details to calculate the bill
        const laundryResponse = await axios.get(`http://localhost:5000/api/laundry/${this.laundryid}`);
        const laundry = laundryResponse.data;

        if (!laundry) {
            throw new Error("Invalid Laundry Item ID.");
        }

        // Calculate bill
        this.bill = this.quantity * laundry.pricing;
    } catch (err) {
        return next(err);
    }

    next();
});

module.exports = mongoose.model("Laundryorder", laundryorderSchema);
